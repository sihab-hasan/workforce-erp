<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SSOTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.google.client_id' => 'mock-google-client-id',
            'services.google.client_secret' => 'mock-google-client-secret',
            'services.google.redirect' => 'http://localhost:5174/auth/callback/google',
            'services.microsoft.client_id' => 'mock-microsoft-client-id',
            'services.microsoft.client_secret' => 'mock-microsoft-client-secret',
            'services.microsoft.redirect' => 'http://localhost:5174/auth/callback/microsoft',
        ]);
    }

    public function test_sso_redirect_generation_includes_pkce_and_state(): void
    {
        foreach (['google', 'microsoft'] as $provider) {
            $response = $this->getJson("/api/v1/auth/sso/redirect/{$provider}")
                ->assertOk()
                ->assertJsonPath('success', true)
                ->assertJsonStructure(['redirect_url', 'state']);

            $redirectUrl = (string) $response->json('redirect_url');
            $this->assertStringContainsString('code_challenge=', $redirectUrl);
            $this->assertStringContainsString('code_challenge_method=S256', $redirectUrl);
            $this->assertStringContainsString('state=', $redirectUrl);
        }

        $this->getJson('/api/v1/auth/sso/redirect/github')->assertStatus(400);
    }

    public function test_google_sso_activates_existing_invited_account(): void
    {
        $user = $this->eligibleUser('google-user@example.com', 'invited');

        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response([
                'access_token' => 'mock-google-access-token',
            ], 200),
            'https://www.googleapis.com/oauth2/v3/userinfo' => Http::response([
                'email' => 'GOOGLE-USER@example.com',
                'email_verified' => true,
                'name' => 'Google User',
                'sub' => 'google-1234567890',
            ], 200),
        ]);

        $redirect = $this->getJson('/api/v1/auth/sso/redirect/google')->assertOk();
        $state = (string) $redirect->json('state');
        parse_str((string) parse_url((string) $redirect->json('redirect_url'), PHP_URL_QUERY), $query);
        $expectedChallenge = $query['code_challenge'] ?? null;

        $this->postJson('/api/v1/auth/sso/callback/google', [
            'code' => 'valid-google-code',
            'state' => $state,
        ])->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.email', 'google-user@example.com')
            ->assertJsonPath('user.sso_provider', 'google');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'google-user@example.com',
            'sso_provider' => 'google',
            'sso_provider_id' => 'google-1234567890',
        ]);
        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->assertDatabaseHas('organization_members', [
            'user_id' => $user->id,
            'status' => 'active',
        ]);

        Http::assertSent(function (HttpRequest $request) use ($expectedChallenge): bool {
            if ($request->url() !== 'https://oauth2.googleapis.com/token') {
                return false;
            }
            $verifier = $request->data()['code_verifier'] ?? null;
            if (! is_string($verifier) || $verifier === '') {
                return false;
            }
            $actual = rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '=');

            return hash_equals((string) $expectedChallenge, $actual);
        });
    }

    public function test_microsoft_sso_activates_existing_invited_account(): void
    {
        $user = $this->eligibleUser('ms-user@example.com', 'invited');

        Http::fake([
            'https://login.microsoftonline.com/common/oauth2/v2.0/token' => Http::response([
                'access_token' => 'mock-ms-access-token',
            ], 200),
            'https://graph.microsoft.com/v1.0/me' => Http::response([
                'mail' => 'ms-user@example.com',
                'displayName' => 'Microsoft User',
                'id' => 'ms-987654321',
            ], 200),
        ]);

        $this->postJson('/api/v1/auth/sso/callback/microsoft', [
            'code' => 'valid-ms-code',
            'state' => $this->stateFor('microsoft'),
        ])->assertOk()
            ->assertJsonPath('user.email', 'ms-user@example.com')
            ->assertJsonPath('user.sso_provider', 'microsoft');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'sso_provider' => 'microsoft',
            'sso_provider_id' => 'ms-987654321',
        ]);
        $this->assertDatabaseHas('organization_members', [
            'user_id' => $user->id,
            'status' => 'active',
        ]);
    }

    public function test_unknown_sso_identity_cannot_self_register(): void
    {
        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response(['access_token' => 'token'], 200),
            'https://www.googleapis.com/oauth2/v3/userinfo' => Http::response([
                'email' => 'unknown@example.com',
                'email_verified' => true,
                'name' => 'Unknown',
                'sub' => 'unknown-google-id',
            ], 200),
        ]);

        $this->postJson('/api/v1/auth/sso/callback/google', [
            'code' => 'code',
            'state' => $this->stateFor('google'),
        ])->assertForbidden()->assertJson([
            'success' => false,
            'message' => 'No eligible Workforce account is available for this identity.',
        ]);

        $this->assertDatabaseMissing('users', ['email' => 'unknown@example.com']);
    }

    public function test_existing_user_without_membership_cannot_use_sso(): void
    {
        User::create([
            'name' => 'No Tenant',
            'email' => 'no-tenant@example.com',
            'password' => Hash::make('password'),
        ]);

        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response(['access_token' => 'token'], 200),
            'https://www.googleapis.com/oauth2/v3/userinfo' => Http::response([
                'email' => 'no-tenant@example.com',
                'email_verified' => true,
                'name' => 'No Tenant',
                'sub' => 'google-no-tenant',
            ], 200),
        ]);

        $this->postJson('/api/v1/auth/sso/callback/google', [
            'code' => 'code',
            'state' => $this->stateFor('google'),
        ])->assertForbidden();
    }

    public function test_google_sso_requires_verified_email(): void
    {
        $this->eligibleUser('unverified@example.com');

        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response(['access_token' => 'token'], 200),
            'https://www.googleapis.com/oauth2/v3/userinfo' => Http::response([
                'email' => 'unverified@example.com',
                'email_verified' => false,
                'name' => 'Unverified',
                'sub' => 'unverified-google-id',
            ], 200),
        ]);

        $this->postJson('/api/v1/auth/sso/callback/google', [
            'code' => 'code',
            'state' => $this->stateFor('google'),
        ])->assertForbidden()->assertJson([
            'success' => false,
            'message' => 'The SSO provider email address is not verified.',
        ]);
    }

    public function test_linking_existing_active_account_to_sso(): void
    {
        $user = $this->eligibleUser('existing-user@example.com');

        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response(['access_token' => 'token'], 200),
            'https://www.googleapis.com/oauth2/v3/userinfo' => Http::response([
                'email' => 'existing-user@example.com',
                'email_verified' => true,
                'name' => 'Google Name',
                'sub' => 'google-user-999',
            ], 200),
        ]);

        $this->postJson('/api/v1/auth/sso/callback/google', [
            'code' => 'existing-user-code',
            'state' => $this->stateFor('google'),
        ])->assertOk()->assertJsonPath('user.sso_provider', 'google');

        $user->refresh();
        $this->assertSame('google', $user->sso_provider);
        $this->assertSame('google-user-999', $user->sso_provider_id);
    }

    public function test_linking_fails_if_different_sso_provider_is_already_linked(): void
    {
        $user = $this->eligibleUser('sso-conflict@example.com');
        $user->forceFill([
            'sso_provider' => 'google',
            'sso_provider_id' => 'google-id-123',
        ])->save();

        Http::fake([
            'https://login.microsoftonline.com/common/oauth2/v2.0/token' => Http::response(['access_token' => 'token'], 200),
            'https://graph.microsoft.com/v1.0/me' => Http::response([
                'mail' => 'sso-conflict@example.com',
                'displayName' => 'Microsoft Name',
                'id' => 'ms-id-456',
            ], 200),
        ]);

        $this->postJson('/api/v1/auth/sso/callback/microsoft', [
            'code' => 'conflict-code',
            'state' => $this->stateFor('microsoft'),
        ])->assertStatus(409)->assertJson([
            'success' => false,
            'message' => 'This email is already associated with another login provider.',
        ]);
    }

    public function test_sso_code_exchange_failure_and_state_replay_protection(): void
    {
        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response(['error' => 'invalid_grant'], 400),
        ]);

        $state = $this->stateFor('google');
        $this->postJson('/api/v1/auth/sso/callback/google', [
            'code' => 'invalid-google-code',
            'state' => $state,
        ])->assertStatus(400)->assertJsonPath('message', 'Failed to exchange authorization code.');

        // State is pull-once, so the same transaction cannot be replayed.
        $this->postJson('/api/v1/auth/sso/callback/google', [
            'code' => 'anything',
            'state' => $state,
        ])->assertStatus(419)->assertJsonPath('message', 'Invalid or expired SSO state.');
    }

    private function stateFor(string $provider): string
    {
        return (string) $this->getJson("/api/v1/auth/sso/redirect/{$provider}")
            ->assertOk()
            ->json('state');
    }

    private function eligibleUser(string $email, string $status = 'active'): User
    {
        $organization = Organization::create([
            'name' => 'Org '.uniqid(),
            'slug' => 'org-'.uniqid(),
        ]);
        $user = User::create([
            'name' => 'SSO User',
            'email' => $email,
            'password' => Hash::make('password'),
        ]);
        $organization->members()->attach($user->id, [
            'role' => 'staff',
            'status' => $status,
        ]);

        return $user;
    }
}
