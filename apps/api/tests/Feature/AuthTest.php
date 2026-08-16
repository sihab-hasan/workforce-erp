<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();

        $this->organization = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
        $this->user = User::create([
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'password' => Hash::make('secret-password'),
        ]);
        $this->organization->members()->attach($this->user->id, [
            'role' => 'staff',
            'status' => 'active',
        ]);
    }

    public function test_login_success(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => ' JOHN.DOE@example.com ',
            'password' => 'secret-password',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'user' => ['id', 'name', 'email', 'role', 'organization_id', 'organization_name'],
            ])
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.email', 'john.doe@example.com')
            ->assertJsonPath('user.role', 'staff')
            ->assertJsonPath('user.organization_id', (string) $this->organization->id);

        $this->assertAuthenticatedAs($this->user);
    }

    public function test_browser_login_does_not_issue_a_personal_access_token(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'secret-password',
            'client' => 'admin',
        ])->assertOk();

        $this->assertSame(0, $this->user->tokens()->count());
        $this->assertAuthenticatedAs($this->user);
    }

    public function test_login_with_invalid_credentials_is_generic(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'john.doe@example.com',
            'password' => 'wrong-password',
        ])->assertUnauthorized()->assertJson([
            'success' => false,
            'message' => 'Invalid email or password.',
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'secret-password',
        ])->assertUnauthorized()->assertJson([
            'success' => false,
            'message' => 'Invalid email or password.',
        ]);
    }

    public function test_user_without_membership_cannot_sign_in(): void
    {
        $outsider = User::create([
            'name' => 'Outsider',
            'email' => 'outsider@example.com',
            'password' => Hash::make('secret-password'),
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => $outsider->email,
            'password' => 'secret-password',
        ])->assertForbidden()->assertJson([
            'success' => false,
            'message' => 'Your account does not have active Workforce access. Contact an administrator.',
        ]);
    }

    public function test_invited_membership_must_use_activation_flow(): void
    {
        $this->user->memberships()->update(['status' => 'invited']);

        $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'secret-password',
        ])->assertForbidden()->assertJson([
            'success' => false,
            'message' => 'Your invitation is not active yet. Use the one-time-code sign-in flow to activate it.',
        ]);
    }

    public function test_inactive_membership_cannot_sign_in_with_password(): void
    {
        $this->user->memberships()->update(['status' => 'inactive']);

        $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'secret-password',
        ])->assertForbidden()->assertJson([
            'success' => false,
            'message' => 'Your account does not have active Workforce access. Contact an administrator.',
        ]);
    }

    public function test_auth_payload_uses_highest_active_role_across_memberships_until_tenant_selection_exists(): void
    {
        $adminOrganization = Organization::create(['name' => 'Admin Org', 'slug' => 'admin-org']);
        $adminOrganization->members()->attach($this->user->id, [
            'role' => 'admin',
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'secret-password',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.role', 'admin')
            ->assertJsonPath('user.organization_id', (string) $adminOrganization->id);
    }

    public function test_protected_route_rejects_unauthenticated(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_session_retrieval_success(): void
    {
        $token = $this->user->createToken('test_token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.email', 'john.doe@example.com')
            ->assertJsonPath('user.organization_id', (string) $this->organization->id);
    }

    public function test_existing_token_is_rejected_if_workforce_membership_is_no_longer_active(): void
    {
        $token = $this->user->createToken('test_token')->plainTextToken;
        $this->user->memberships()->update(['status' => 'suspended']);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Unauthenticated.');

        $this->assertSame(0, $this->user->tokens()->count());
    }

    public function test_logout_revokes_current_token(): void
    {
        $token = $this->user->createToken('test_token')->plainTextToken;
        $headers = ['Authorization' => "Bearer {$token}"];

        $this->withHeaders($headers)
            ->postJson('/api/v1/auth/logout')
            ->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Logged out successfully.',
            ]);

        Auth::forgetGuards();

        $this->withHeaders($headers)
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized();
    }
}
