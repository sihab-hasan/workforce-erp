<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SSOTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::forget('sso:microsoft:jwks');

        config([
            'services.google.client_id' => 'mock-google-client-id',
            'services.google.client_secret' => 'mock-google-client-secret',
            'services.google.redirect' => 'https://app.example.test/sso/callback/google',
            'services.microsoft.client_id' => 'mock-microsoft-client-id',
            'services.microsoft.client_secret' => 'mock-microsoft-client-secret',
            'services.microsoft.redirect' => 'https://app.example.test/sso/callback/microsoft',
            'services.microsoft.tenant' => 'common',
        ]);
    }

    public function test_google_sso_links_by_durable_subject_and_preserves_pkce(): void
    {
        $user = $this->eligibleUser('google-user@example.com');

        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response([
                'access_token' => 'mock-google-access-token',
            ]),
            'https://openidconnect.googleapis.com/v1/userinfo' => Http::response([
                'email' => 'GOOGLE-USER@example.com',
                'email_verified' => true,
                'name' => 'Google User',
                'sub' => 'google-1234567890',
            ]),
        ]);

        $redirect = $this->getJson('/api/v1/auth/sso/redirect/google?client=erp')->assertOk();
        $state = (string) $redirect->json('state');
        parse_str((string) parse_url((string) $redirect->json('redirect_url'), PHP_URL_QUERY), $query);
        $expectedChallenge = (string) ($query['code_challenge'] ?? '');

        $this->postJson('/api/v1/auth/sso/callback/google', [
            'code' => 'valid-google-code',
            'state' => $state,
            'client' => 'erp',
        ])->assertOk()->assertJsonPath('success', true);

        $this->assertDatabaseHas('user_sso_identities', [
            'user_id' => $user->id,
            'provider' => 'google',
            'issuer' => 'https://accounts.google.com',
            'provider_subject_id' => 'google-1234567890',
            'email' => 'google-user@example.com',
        ]);
        $this->assertNotNull($user->fresh()->email_verified_at);

        Http::assertSent(function (HttpRequest $request) use ($expectedChallenge): bool {
            if ($request->url() !== 'https://oauth2.googleapis.com/token') {
                return false;
            }
            $verifier = $request->data()['code_verifier'] ?? null;
            if (! is_string($verifier) || $verifier === '') {
                return false;
            }
            $actual = rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '=');

            return $expectedChallenge !== '' && hash_equals($expectedChallenge, $actual);
        });
    }

    public function test_unknown_google_identity_auto_provisions_user_and_organization(): void
    {
        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response(['access_token' => 'token']),
            'https://openidconnect.googleapis.com/v1/userinfo' => Http::response([
                'email' => 'unknown@example.com',
                'email_verified' => true,
                'name' => 'Unknown User',
                'sub' => 'unknown-google-id',
            ]),
        ]);

        $this->postJson('/api/v1/auth/sso/callback/google', [
            'code' => 'code',
            'state' => $this->stateFor('google'),
            'client' => 'erp',
        ])->assertOk()->assertJsonPath('success', true);

        $this->assertDatabaseHas('users', ['email' => 'unknown@example.com']);
        $this->assertDatabaseHas('user_sso_identities', [
            'provider' => 'google',
            'email' => 'unknown@example.com',
            'provider_subject_id' => 'unknown-google-id',
        ]);
    }

    public function test_google_sso_requires_verified_provider_email(): void
    {
        $this->eligibleUser('unverified-provider@example.com');

        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response(['access_token' => 'token']),
            'https://openidconnect.googleapis.com/v1/userinfo' => Http::response([
                'email' => 'unverified-provider@example.com',
                'email_verified' => false,
                'name' => 'Unverified',
                'sub' => 'unverified-google-id',
            ]),
        ]);

        $this->postJson('/api/v1/auth/sso/callback/google', [
            'code' => 'code',
            'state' => $this->stateFor('google'),
            'client' => 'erp',
        ])->assertForbidden();
    }

    public function test_sso_state_is_single_use(): void
    {
        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response(['error' => 'invalid_grant'], 400),
        ]);

        $state = $this->stateFor('google');
        $payload = ['code' => 'invalid-code', 'state' => $state, 'client' => 'erp'];

        $this->postJson('/api/v1/auth/sso/callback/google', $payload)->assertStatus(400);
        $this->postJson('/api/v1/auth/sso/callback/google', $payload)->assertStatus(419);
    }

    public function test_microsoft_sso_verifies_signature_issuer_tenant_and_audience(): void
    {
        $user = $this->eligibleUser('ms-user@example.com');
        [$idToken, $jwks] = $this->signedMicrosoftToken();

        Http::fake([
            'https://login.microsoftonline.com/common/oauth2/v2.0/token' => Http::response([
                'access_token' => 'mock-ms-access-token',
                'id_token' => $idToken,
            ]),
            'https://graph.microsoft.com/oidc/userinfo' => Http::response([
                'email' => 'ms-user@example.com',
                'name' => 'Microsoft User',
                'sub' => 'ms-987654321',
            ]),
            'https://login.microsoftonline.com/common/discovery/v2.0/keys' => Http::response($jwks),
        ]);

        $this->postJson('/api/v1/auth/sso/callback/microsoft', [
            'code' => 'valid-ms-code',
            'state' => $this->stateFor('microsoft'),
            'client' => 'erp',
        ])->assertOk()
            ->assertJsonPath('status', 'authenticated')
            ->assertJsonPath('user.connected_sso.0.provider', 'microsoft');

        $this->assertDatabaseHas('user_sso_identities', [
            'user_id' => $user->id,
            'provider' => 'microsoft',
            'issuer' => 'https://login.microsoftonline.com/11111111-2222-3333-4444-555555555555/v2.0',
            'provider_tenant' => '11111111-2222-3333-4444-555555555555',
            'provider_subject_id' => 'ms-987654321',
        ]);
    }

    public function test_microsoft_sso_rejects_an_unverifiable_id_token(): void
    {
        $this->eligibleUser('ms-user@example.com');

        Http::fake([
            'https://login.microsoftonline.com/common/oauth2/v2.0/token' => Http::response([
                'access_token' => 'mock-ms-access-token',
                'id_token' => 'not-a-signed-jwt',
            ]),
            'https://graph.microsoft.com/oidc/userinfo' => Http::response([
                'email' => 'ms-user@example.com',
                'name' => 'Microsoft User',
                'sub' => 'ms-987654321',
            ]),
            'https://login.microsoftonline.com/common/discovery/v2.0/keys' => Http::response(['keys' => []]),
        ]);

        $this->postJson('/api/v1/auth/sso/callback/microsoft', [
            'code' => 'valid-ms-code',
            'state' => $this->stateFor('microsoft'),
            'client' => 'erp',
        ])->assertForbidden();

        $this->assertDatabaseMissing('user_sso_identities', [
            'provider' => 'microsoft',
            'provider_subject_id' => 'ms-987654321',
        ]);
    }

    /** @return array{0:string,1:array{keys:array<int,array<string,string>>}} */
    private function signedMicrosoftToken(): array
    {
        $options = [
            'private_key_bits' => 2048,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ];
        $cnf = dirname(PHP_BINARY).'/extras/ssl/openssl.cnf';
        if (file_exists($cnf)) {
            $options['config'] = $cnf;
        }
        $resource = openssl_pkey_new($options);
        $this->assertNotFalse($resource);
        $this->assertTrue(openssl_pkey_export($resource, $privateKey, null, $options));
        $details = openssl_pkey_get_details($resource);
        $this->assertIsArray($details);
        $rsa = $details['rsa'];
        $kid = 'test-signing-key';
        $tenant = '11111111-2222-3333-4444-555555555555';

        $header = ['typ' => 'JWT', 'alg' => 'RS256', 'kid' => $kid];
        $claims = [
            'iss' => "https://login.microsoftonline.com/{$tenant}/v2.0",
            'aud' => 'mock-microsoft-client-id',
            'tid' => $tenant,
            'sub' => 'ms-987654321',
            'iat' => time() - 30,
            'nbf' => time() - 30,
            'exp' => time() + 3600,
        ];
        $unsigned = $this->base64Url(json_encode($header, JSON_THROW_ON_ERROR)).'.'.$this->base64Url(json_encode($claims, JSON_THROW_ON_ERROR));
        $this->assertTrue(openssl_sign($unsigned, $signature, $privateKey, OPENSSL_ALGO_SHA256));

        return [
            $unsigned.'.'.$this->base64Url($signature),
            ['keys' => [[
                'kty' => 'RSA',
                'use' => 'sig',
                'kid' => $kid,
                'alg' => 'RS256',
                'n' => $this->base64Url($rsa['n']),
                'e' => $this->base64Url($rsa['e']),
            ]]],
        ];
    }

    private function base64Url(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function stateFor(string $provider): string
    {
        return (string) $this->getJson("/api/v1/auth/sso/redirect/{$provider}?client=erp")
            ->assertOk()
            ->json('state');
    }

    private function eligibleUser(string $email): User
    {
        $organization = Organization::create([
            'name' => 'Org '.uniqid(),
            'slug' => 'org-'.uniqid(),
        ]);
        $user = User::factory()->create([
            'email' => $email,
            'email_verified_at' => null,
        ]);
        $organization->members()->attach($user->id, [
            'role' => 'staff',
            'status' => 'active',
        ]);

        return $user;
    }
}
