<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use App\Models\UserSsoIdentity;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SsoService
{
    private const PROVIDERS = ['google', 'microsoft'];

    public function redirect(string $provider, string $client = 'erp'): array
    {
        $this->assertSupported($provider);
        $this->assertConfigured($provider);
        $state = Str::random(48);
        $verifier = Str::random(96);
        $challenge = rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '=');
        Cache::put('sso:state:'.hash('sha256', $state), ['provider' => $provider, 'verifier' => $verifier, 'client' => $client], now()->addMinutes(10));

        return ['redirect_url' => $this->authorizationUrl($provider, $state, $challenge), 'state' => $state];
    }

    public function authenticate(string $provider, string $code, string $state, string $client = 'erp'): User
    {
        $this->assertSupported($provider);
        $this->assertConfigured($provider);
        $tx = Cache::pull('sso:state:'.hash('sha256', $state));
        if (! is_array($tx) || ($tx['provider'] ?? null) !== $provider || ($tx['client'] ?? null) !== $client || ! is_string($tx['verifier'] ?? null)) {
            abort(419, 'Invalid or expired SSO state.');
        } try {
            $profile = $provider === 'google' ? $this->google($code, $tx['verifier']) : $this->microsoft($code, $tx['verifier']);
        } catch (ConnectionException) {
            abort(502, 'SSO provider is temporarily unavailable.');
        }
        $email = Str::lower(trim((string) $profile['email']));
        $subject = trim((string) $profile['subject']);
        $issuer = trim((string) $profile['issuer']);
        $tenant = $profile['tenant'] ?? null;
        if ($email === '' || $subject === '' || $issuer === '') {
            abort(400, 'SSO provider did not return a valid identity.');
        }
        $identity = UserSsoIdentity::query()->with('user')->where('provider', $provider)->where('issuer', $issuer)->where('provider_subject_id', $subject)->first();
        $user = $identity?->user;
        if (! $user) {
            $user = User::query()->where('email', $email)->first();
            if (! $user) {
                $user = DB::transaction(function () use ($email, $profile) {
                    $fullName = trim((string) ($profile['metadata']['name'] ?? '')) ?: explode('@', $email)[0];
                    $newUser = User::query()->create([
                        'name' => $fullName,
                        'email' => $email,
                        'password' => Hash::make(Str::random(32)),
                        'email_verified_at' => now(),
                        'password_initialized_at' => now(),
                        'status' => 'active',
                    ]);

                    $orgName = $fullName."'s Team";
                    $baseSlug = Str::slug($orgName) ?: 'organization';
                    $slug = $baseSlug;
                    $counter = 2;
                    while (Organization::withTrashed()->where('slug', $slug)->exists()) {
                        $slug = $baseSlug.'-'.$counter++;
                    }

                    $organization = Organization::query()->create([
                        'name' => $orgName,
                        'slug' => $slug,
                        'country' => 'US',
                        'status' => 'active',
                        'plan' => 'trial',
                        'trial_started_at' => now(),
                        'trial_ends_at' => now()->addDays(14),
                        'subscription_status' => 'trialing',
                        'onboarding_status' => 'in_progress',
                        'onboarding_step' => 'organization',
                    ]);

                    $membership = $newUser->memberships()->create([
                        'organization_id' => $organization->id,
                        'role' => 'owner',
                        'status' => 'active',
                        'data_scope' => 'ORGANIZATION',
                        'activated_at' => now(),
                    ]);

                    app(RegistrationService::class)->ensureDefaultRoles($organization->id);
                    $ownerRole = Role::query()
                        ->where('organization_id', $organization->id)
                        ->where('name', 'organization_owner')
                        ->first();

                    if ($ownerRole) {
                        $membership->roleAssignments()->create([
                            'role_id' => $ownerRole->id,
                            'scope' => 'ORGANIZATION',
                            'reason' => 'SSO initial tenant owner provisioning',
                        ]);
                    }

                    return $newUser;
                });
            }

            $existing = UserSsoIdentity::query()->where('user_id', $user->id)->where('provider', $provider)->first();
            if ($existing && (! hash_equals((string) $existing->provider_subject_id, $subject) || ! hash_equals((string) $existing->issuer, $issuer))) {
                abort(409, 'A different account from this provider is already linked.');
            }

            if (! $existing) {
                $identity = UserSsoIdentity::query()->create([
                    'user_id' => $user->id,
                    'provider' => $provider,
                    'issuer' => $issuer,
                    'provider_tenant' => $tenant,
                    'provider_subject_id' => $subject,
                    'provider_user_id' => $subject,
                    'email' => $email,
                    'metadata' => $profile['metadata'] ?? [],
                ]);
            }
        }
        if (! $user || $user->status !== 'active' || $user->locked_at) {
            abort(403, 'No eligible Workforce account is available for this identity.');
        } if ($identity && Str::lower((string) $identity->email) !== $email) {
            $identity->forceFill(['email' => $email, 'provider_tenant' => $tenant, 'metadata' => $profile['metadata'] ?? []])->save();
        } if (! $user->email_verified_at) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        return $user;
    }

    private function google(string $code, string $verifier): array
    {
        $t = Http::asForm()->connectTimeout(5)->timeout(10)->post('https://oauth2.googleapis.com/token', ['client_id' => config('services.google.client_id'), 'client_secret' => config('services.google.client_secret'), 'redirect_uri' => config('services.google.redirect'), 'code' => $code, 'grant_type' => 'authorization_code', 'code_verifier' => $verifier]);
        if ($t->failed()) {
            Log::warning('Google OAuth token exchange failed.', ['status' => $t->status(), 'provider_error' => $t->json('error')]);
            abort(400, 'Failed to exchange authorization code.');
        }$at = $t->json('access_token');
        if (! is_string($at) || $at === '') {
            abort(400, 'Google did not return an access token.');
        }$p = Http::withToken($at)->timeout(10)->get('https://openidconnect.googleapis.com/v1/userinfo');
        if ($p->failed() || $p->json('email_verified') !== true) {
            abort(403, 'The SSO provider identity could not be verified.');
        }

        return ['email' => $p->json('email'), 'subject' => $p->json('sub'), 'issuer' => 'https://accounts.google.com', 'tenant' => null, 'metadata' => ['name' => $p->json('name')]];
    }

    private function microsoft(string $code, string $verifier): array
    {
        $t = Http::asForm()->connectTimeout(5)->timeout(10)->post($this->authority().'/oauth2/v2.0/token', ['client_id' => config('services.microsoft.client_id'), 'client_secret' => config('services.microsoft.client_secret'), 'redirect_uri' => config('services.microsoft.redirect'), 'code' => $code, 'grant_type' => 'authorization_code', 'code_verifier' => $verifier, 'scope' => 'openid profile email User.Read']);
        if ($t->failed()) {
            Log::warning('Microsoft OAuth token exchange failed.', ['status' => $t->status(), 'provider_error' => $t->json('error')]);
            abort(400, 'Failed to exchange authorization code.');
        }$at = $t->json('access_token');
        if (! is_string($at) || $at === '') {
            abort(400, 'Microsoft did not return an access token.');
        }$p = Http::withToken($at)->timeout(10)->get('https://graph.microsoft.com/oidc/userinfo');
        if ($p->failed()) {
            abort(400, 'Failed to retrieve the Microsoft OpenID profile.');
        }$claims = $this->verifiedMicrosoftClaims((string) $t->json('id_token', ''));
        $tenant = (string) ($claims['tid'] ?? '');
        $issuer = (string) ($claims['iss'] ?? '');
        $aud = $claims['aud'] ?? null;
        $exp = (int) ($claims['exp'] ?? 0);
        if ($issuer === '' || $tenant === '' || $aud !== config('services.microsoft.client_id') || $exp <= time()) {
            abort(403, 'Microsoft identity token claims are invalid.');
        }$configured = (string) config('services.microsoft.tenant', 'common');
        if (! in_array($configured, ['common', 'organizations'], true) && ! hash_equals($configured, $tenant)) {
            abort(403, 'Microsoft tenant is not allowed.');
        }if (! preg_match('#^https://login\.microsoftonline\.com/[0-9a-fA-F-]+/v2\.0$#', $issuer)) {
            abort(403, 'Microsoft issuer is invalid.');
        }$email = $p->json('email') ?: $p->json('preferred_username');

        return ['email' => $email, 'subject' => $p->json('sub'), 'issuer' => $issuer, 'tenant' => $tenant, 'metadata' => ['name' => $p->json('name')]];
    }

    private function authorizationUrl(string $p, string $state, string $challenge): string
    {
        if ($p === 'google') {
            return 'https://accounts.google.com/o/oauth2/v2/auth?'.http_build_query(['client_id' => config('services.google.client_id'), 'redirect_uri' => config('services.google.redirect'), 'response_type' => 'code', 'scope' => 'openid profile email', 'state' => $state, 'code_challenge' => $challenge, 'code_challenge_method' => 'S256', 'prompt' => 'select_account']);
        }

        return $this->authority().'/oauth2/v2.0/authorize?'.http_build_query(['client_id' => config('services.microsoft.client_id'), 'redirect_uri' => config('services.microsoft.redirect'), 'response_type' => 'code', 'scope' => 'openid profile email User.Read', 'state' => $state, 'code_challenge' => $challenge, 'code_challenge_method' => 'S256', 'prompt' => 'select_account']);
    }

    private function authority(): string
    {
        return 'https://login.microsoftonline.com/'.rawurlencode((string) config('services.microsoft.tenant', 'common'));
    }

    private function assertSupported(string $p): void
    {
        if (! in_array($p, self::PROVIDERS, true)) {
            abort(400, 'Unsupported provider.');
        }
    }

    private function assertConfigured(string $p): void
    {
        if (! config("services.$p.client_id") || ! config("services.$p.client_secret") || ! config("services.$p.redirect")) {
            abort(503, 'Single sign-on is not configured for this provider.');
        }
    }

    private function verifiedMicrosoftClaims(string $jwt): array
    {
        if ($jwt === '') {
            abort(403, 'Microsoft identity token is missing.');
        } try {
            $jwks = Cache::remember('sso:microsoft:jwks', now()->addHours(12), function () {
                $response = Http::connectTimeout(5)->timeout(10)->get('https://login.microsoftonline.com/common/discovery/v2.0/keys');
                if ($response->failed()) {
                    throw new \RuntimeException('Microsoft signing keys unavailable.');
                } $data = $response->json();
                if (! is_array($data) || ! is_array($data['keys'] ?? null)) {
                    throw new \RuntimeException('Microsoft signing keys are invalid.');
                }

                return $data;
            });
            $decoded = JWT::decode($jwt, JWK::parseKeySet($jwks));
            $claims = json_decode(json_encode($decoded, JSON_THROW_ON_ERROR), true, 512, JSON_THROW_ON_ERROR);
            if (! is_array($claims)) {
                throw new \RuntimeException('Microsoft identity claims are invalid.');
            }

            return $claims;
        } catch (\Throwable $e) {
            Log::warning('Microsoft identity token verification failed.', ['exception' => $e::class]);
            abort(403, 'Microsoft identity token could not be verified.');
        }
    }
}
