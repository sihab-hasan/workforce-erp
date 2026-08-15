<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Create standard test user
        $this->user = User::create([
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'password' => Hash::make('secret-password'),
        ]);
    }

    /**
     * Test login with valid credentials.
     */
    public function test_login_success(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'john.doe@example.com',
            'password' => 'secret-password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'token',
                'user' => ['id', 'name', 'email'],
            ])
            ->assertJson([
                'success' => true,
                'user' => [
                    'email' => 'john.doe@example.com',
                ],
            ]);

        $this->assertNotEmpty($response->json()['token']);
    }

    /**
     * Test login with invalid password.
     */
    public function test_login_invalid_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'john.doe@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid email or password.',
            ]);
    }

    /**
     * Test login with non-existent email.
     */
    public function test_login_invalid_email(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'secret-password',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid email or password.',
            ]);
    }

    /**
     * Test protected route rejects unauthenticated request.
     */
    public function test_protected_route_rejects_unauthenticated(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        // Laravel Sanctum returns 401 Unauthorized for unauthenticated requests
        $response->assertStatus(401);
    }

    /**
     * Test authenticated session profile retrieval.
     */
    public function test_session_retrieval_success(): void
    {
        $token = $this->user->createToken('test_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'user' => [
                    'email' => 'john.doe@example.com',
                    'name' => 'John Doe',
                ],
            ]);
    }

    /**
     * Test session token invalidation on logout.
     */
    public function test_logout_success(): void
    {
        $token = $this->user->createToken('test_token')->plainTextToken;

        // Perform logout
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logged out successfully.',
            ]);

        // Clear in-memory auth guard cache
        \Illuminate\Support\Facades\Auth::forgetGuards();

        // Verify token is deleted/invalidated
        $meResponse = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/v1/auth/me');

        $meResponse->assertStatus(401);
    }
}
