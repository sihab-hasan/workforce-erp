<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SSOTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test redirect endpoint returns correct provider URLs.
     */
    public function test_sso_redirect_generation(): void
    {
        // Google redirect URL
        $response = $this->getJson('/api/v1/auth/sso/redirect/google');
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $redirectUrl = $response->json()['redirect_url'];
        $this->assertStringContainsString('https://accounts.google.com/o/oauth2/v2/auth', $redirectUrl);
        $this->assertStringContainsString('client_id=mock-google-client-id', $redirectUrl);

        // Microsoft redirect URL
        $response = $this->getJson('/api/v1/auth/sso/redirect/microsoft');
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $redirectUrl = $response->json()['redirect_url'];
        $this->assertStringContainsString('https://login.microsoftonline.com/common/oauth2/v2.0/authorize', $redirectUrl);
        $this->assertStringContainsString('client_id=mock-microsoft-client-id', $redirectUrl);

        // Unsupported provider
        $response = $this->getJson('/api/v1/auth/sso/redirect/github');
        $response->assertStatus(400);
    }

    /**
     * Test successful Google SSO registration/login.
     */
    public function test_google_sso_success_flow(): void
    {
        // Fake Google auth endpoints
        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response([
                'access_token' => 'mock-google-access-token',
            ], 200),
            'https://www.googleapis.com/oauth2/v3/userinfo' => Http::response([
                'email' => 'new-google-user@example.com',
                'name' => 'Google User',
                'sub' => 'google-1234567890',
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/auth/sso/callback/google', [
            'code' => 'valid-google-code',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'token',
                'user' => ['id', 'name', 'email', 'sso_provider'],
            ])
            ->assertJson([
                'success' => true,
                'user' => [
                    'email' => 'new-google-user@example.com',
                    'sso_provider' => 'google',
                ],
            ]);

        // Verify user was created in the database
        $this->assertDatabaseHas('users', [
            'email' => 'new-google-user@example.com',
            'sso_provider' => 'google',
            'sso_provider_id' => 'google-1234567890',
        ]);
    }

    /**
     * Test successful Microsoft SSO registration/login.
     */
    public function test_microsoft_sso_success_flow(): void
    {
        // Fake Microsoft Graph endpoints
        Http::fake([
            'https://login.microsoftonline.com/common/oauth2/v2.0/token' => Http::response([
                'access_token' => 'mock-ms-access-token',
            ], 200),
            'https://graph.microsoft.com/v1.0/me' => Http::response([
                'mail' => 'new-ms-user@example.com',
                'displayName' => 'Microsoft User',
                'id' => 'ms-987654321',
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/auth/sso/callback/microsoft', [
            'code' => 'valid-ms-code',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'user' => [
                    'email' => 'new-ms-user@example.com',
                    'sso_provider' => 'microsoft',
                ],
            ]);

        // Verify user was created
        $this->assertDatabaseHas('users', [
            'email' => 'new-ms-user@example.com',
            'sso_provider' => 'microsoft',
            'sso_provider_id' => 'ms-987654321',
        ]);
    }

    /**
     * Test linking existing email accounts to new SSO sign-ins.
     */
    public function test_linking_existing_user_on_sso_login(): void
    {
        // Create an existing user
        $user = User::create([
            'name' => 'Existing User',
            'email' => 'existing-user@example.com',
            'password' => Hash::make('password'),
        ]);

        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response([
                'access_token' => 'mock-google-token',
            ], 200),
            'https://www.googleapis.com/oauth2/v3/userinfo' => Http::response([
                'email' => 'existing-user@example.com',
                'name' => 'Google Name',
                'sub' => 'google-user-999',
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/auth/sso/callback/google', [
            'code' => 'existing-user-code',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'user' => [
                    'email' => 'existing-user@example.com',
                    'sso_provider' => 'google',
                ],
            ]);

        // Verify the existing account has been linked
        $user->refresh();
        $this->assertEquals('google', $user->sso_provider);
        $this->assertEquals('google-user-999', $user->sso_provider_id);
    }

    /**
     * Test login fails if email is already linked to another provider.
     */
    public function test_linking_fails_if_different_sso_provider_linked(): void
    {
        // User already linked to Google
        User::create([
            'name' => 'SSO User',
            'email' => 'sso-conflict@example.com',
            'password' => Hash::make('password'),
            'sso_provider' => 'google',
            'sso_provider_id' => 'google-id-123',
        ]);

        // Attempt callback via Microsoft for the same email
        Http::fake([
            'https://login.microsoftonline.com/common/oauth2/v2.0/token' => Http::response([
                'access_token' => 'mock-ms-token',
            ], 200),
            'https://graph.microsoft.com/v1.0/me' => Http::response([
                'mail' => 'sso-conflict@example.com',
                'displayName' => 'Microsoft Name',
                'id' => 'ms-id-456',
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/auth/sso/callback/microsoft', [
            'code' => 'conflict-code',
        ]);

        $response->assertStatus(409)
            ->assertJson([
                'success' => false,
                'message' => 'This email is already associated with another login provider.',
            ]);
    }

    /**
     * Test authentication code failures.
     */
    public function test_sso_code_exchange_failure(): void
    {
        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response([
                'error' => 'invalid_grant',
            ], 400),
        ]);

        $response = $this->postJson('/api/v1/auth/sso/callback/google', [
            'code' => 'invalid-google-code',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Failed to exchange authorization code.',
            ]);
    }
}
