<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserSsoIdentity;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SsoService
{
    private const PROVIDERS = ['google', 'microsoft'];

    public function __construct(private readonly AuthService $authService) {}

    /**
     * @return array{redirect_url:string,state:string}
     */
    public function redirect(string $provider): array
    {
        $this->assertSupportedProvider($provider);
        $this->assertProviderConfigured($provider);

        $state = Str::random(48);
        $codeVerifier = Str::random(96);
        $codeChallenge = $this->pkceChallenge($codeVerifier);

        Cache::put($this->stateKey($state), [
            'provider' => $provider,
            'code_verifier' => $codeVerifier,
        ], now()->addMinutes(10));

        return [
            'redirect_url' => $this->authorizationUrl($provider, $state, $codeChallenge),
            'state' => $state,
        ];
    }

    public function authenticate(string $provider, string $code, string $state): User
    {
        $this->assertSupportedProvider($provider);
        $this->assertProviderConfigured($provider);

        $transaction = Cache::pull($this->stateKey($state));
        if (
            ! is_array($transaction)
            || ($transaction['provider'] ?? null) !== $provider
            || ! is_string($transaction['code_verifier'] ?? null)
        ) {
            abort(419, 'Invalid or expired SSO state.');
        }

        try {
            [$email, $name, $providerId] = $provider === 'google'
                ? $this->googleProfile($code, $transaction['code_verifier'])
                : $this->microsoftProfile($code, $transaction['code_verifier']);
        } catch (ConnectionException) {
            abort(502, 'SSO provider is temporarily unavailable. Please try again.');
        }

        if (! $email || ! $providerId) {
            abort(400, 'SSO provider did not return a valid email or account ID.');
        }

        $email = Str::lower(trim($email));
        $providerId = trim($providerId);

        // Prefer an already-linked provider identity. If this is the first sign-in
        // with the provider, link only to an existing eligible Workforce account
        // whose email exactly matches the verified provider email.
        $identity = UserSsoIdentity::query()
            ->with('user')
            ->where('provider', $provider)
            ->where('provider_user_id', $providerId)
            ->first();

        if ($identity) {
            $user = $identity->user;
            if (! $user || Str::lower(trim((string) $user->email)) !== $email) {
                abort(409, 'This provider identity no longer matches the Workforce account email. Contact an administrator.');
            }
        } else {
            $user = User::query()->where('email', $email)->first();
        }

        // Workforce ERP is invitation/account based. SSO proves identity; it must
        // never silently create a tenant-less ERP account.
        if (! $user || $this->authService->isBlockedFromSignIn($user, true)) {
            abort(403, 'No eligible Workforce account is available for this identity.');
        }

        if ($user->sso_provider && $user->sso_provider !== $provider) {
            abort(409, 'This email is already associated with another login provider.');
        }

        $providerIdentity = UserSsoIdentity::query()
            ->where('user_id', $user->id)
            ->where('provider', $provider)
            ->first();

        if ($providerIdentity && ! hash_equals((string) $providerIdentity->provider_user_id, $providerId)) {
            abort(409, 'A different account from this provider is already linked to your Workforce account.');
        }

        if (! $providerIdentity) {
            UserSsoIdentity::query()->create([
                'user_id' => $user->id,
                'provider' => $provider,
                'provider_user_id' => $providerId,
                'email' => $email,
            ]);
        } elseif ($providerIdentity->email !== $email) {
            $providerIdentity->forceFill(['email' => $email])->save();
        }

        // Keep legacy columns populated for backward compatibility/auditing. The
        // identity table is authoritative and supports Google + Microsoft together.
        $user->forceFill([
            'sso_provider' => $provider,
            'sso_provider_id' => $providerId,
        ])->save();

        if (! $user->email_verified_at) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        $this->authService->activateInvitations($user);

        return $user;
    }

    private function assertSupportedProvider(string $provider): void
    {
        if (! in_array($provider, self::PROVIDERS, true)) {
            abort(400, 'Unsupported provider.');
        }
    }

    private function assertProviderConfigured(string $provider): void
    {
        if (
            ! config("services.{$provider}.client_id")
            || ! config("services.{$provider}.client_secret")
            || ! config("services.{$provider}.redirect")
        ) {
            abort(503, 'Single sign-on is not configured for this provider. Add the provider credentials to apps/api/.env and clear Laravel config.');
        }
    }

    private function authorizationUrl(string $provider, string $state, string $codeChallenge): string
    {
        if ($provider === 'google') {
            $query = http_build_query([
                'client_id' => config('services.google.client_id'),
                'redirect_uri' => config('services.google.redirect'),
                'response_type' => 'code',
                'scope' => 'openid profile email',
                'state' => $state,
                'code_challenge' => $codeChallenge,
                'code_challenge_method' => 'S256',
                'prompt' => 'select_account',
            ]);

            return 'https://accounts.google.com/o/oauth2/v2/auth?'.$query;
        }

        $query = http_build_query([
            'client_id' => config('services.microsoft.client_id'),
            'redirect_uri' => config('services.microsoft.redirect'),
            'response_type' => 'code',
            'scope' => 'openid profile email User.Read',
            'state' => $state,
            'code_challenge' => $codeChallenge,
            'code_challenge_method' => 'S256',
            'prompt' => 'select_account',
        ]);

        return $this->microsoftAuthority().'/oauth2/v2.0/authorize?'.$query;
    }

    /**
     * @return array{0:?string,1:string,2:?string}
     */
    private function googleProfile(string $code, string $codeVerifier): array
    {
        $tokenResponse = Http::asForm()
            ->connectTimeout(5)
            ->timeout(10)
            ->post('https://oauth2.googleapis.com/token', [
                'client_id' => config('services.google.client_id'),
                'client_secret' => config('services.google.client_secret'),
                'redirect_uri' => config('services.google.redirect'),
                'code' => $code,
                'grant_type' => 'authorization_code',
                'code_verifier' => $codeVerifier,
            ]);

        if ($tokenResponse->failed()) {
            Log::warning('Google OAuth token exchange failed.', [
                'status' => $tokenResponse->status(),
                'provider_error' => $tokenResponse->json('error'),
            ]);
            abort(400, 'Failed to exchange authorization code.');
        }

        $accessToken = $tokenResponse->json('access_token');
        if (! is_string($accessToken) || $accessToken === '') {
            abort(400, 'Google did not return an access token.');
        }

        $profileResponse = Http::withToken($accessToken)
            ->connectTimeout(5)
            ->timeout(10)
            ->get('https://www.googleapis.com/oauth2/v3/userinfo');

        if ($profileResponse->failed()) {
            abort(400, 'Failed to retrieve the Google user profile.');
        }

        $profile = $profileResponse->json();

        if (($profile['email_verified'] ?? false) !== true) {
            abort(403, 'The SSO provider email address is not verified.');
        }

        return [
            $profile['email'] ?? null,
            $profile['name'] ?? 'Google User',
            $profile['sub'] ?? null,
        ];
    }

    /**
     * @return array{0:?string,1:string,2:?string}
     */
    private function microsoftProfile(string $code, string $codeVerifier): array
    {
        $tokenResponse = Http::asForm()
            ->connectTimeout(5)
            ->timeout(10)
            ->post($this->microsoftAuthority().'/oauth2/v2.0/token', [
                'client_id' => config('services.microsoft.client_id'),
                'client_secret' => config('services.microsoft.client_secret'),
                'redirect_uri' => config('services.microsoft.redirect'),
                'code' => $code,
                'grant_type' => 'authorization_code',
                'code_verifier' => $codeVerifier,
            ]);

        if ($tokenResponse->failed()) {
            Log::warning('Microsoft OAuth token exchange failed.', [
                'status' => $tokenResponse->status(),
                'provider_error' => $tokenResponse->json('error'),
                'provider_error_codes' => $tokenResponse->json('error_codes'),
            ]);
            abort(400, 'Failed to exchange authorization code.');
        }

        $accessToken = $tokenResponse->json('access_token');
        if (! is_string($accessToken) || $accessToken === '') {
            abort(400, 'Microsoft did not return an access token.');
        }

        $profileResponse = Http::withToken($accessToken)
            ->connectTimeout(5)
            ->timeout(10)
            ->get('https://graph.microsoft.com/v1.0/me');

        if ($profileResponse->failed()) {
            abort(400, 'Failed to retrieve the Microsoft user profile. Confirm Microsoft Graph delegated User.Read permission is available.');
        }

        $profile = $profileResponse->json();

        return [
            $profile['mail'] ?? $profile['userPrincipalName'] ?? null,
            $profile['displayName'] ?? 'Microsoft User',
            $profile['id'] ?? null,
        ];
    }

    private function microsoftAuthority(): string
    {
        $tenant = trim((string) config('services.microsoft.tenant', 'common'));
        if ($tenant === '' || ! preg_match('/^[A-Za-z0-9.-]+$/', $tenant)) {
            abort(500, 'Microsoft SSO tenant configuration is invalid.');
        }

        return 'https://login.microsoftonline.com/'.rawurlencode($tenant);
    }

    private function pkceChallenge(string $codeVerifier): string
    {
        return rtrim(strtr(base64_encode(hash('sha256', $codeVerifier, true)), '+/', '-_'), '=');
    }

    private function stateKey(string $state): string
    {
        return 'sso-state:'.hash('sha256', $state);
    }
}
