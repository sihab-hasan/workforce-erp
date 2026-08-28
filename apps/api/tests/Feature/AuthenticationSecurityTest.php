<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Permission;
use App\Models\RegistrationChallenge;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class AuthenticationSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_ordinary_browser_login_uses_cookie_session(): void
    {
        [$user] = $this->member('employee', false);

        $this->postJson('/api/v1/auth/login', [
            'email' => ' '.strtoupper($user->email).' ',
            'password' => 'a sufficiently long employee passphrase',
            'client' => 'erp',
        ])->assertOk()->assertJsonPath('status', 'authenticated');

        $this->assertAuthenticatedAs($user);
    }

    public function test_privileged_login_requires_verification_before_full_session(): void
    {
        [$user] = $this->member('organization_owner', true);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'a sufficiently long employee passphrase',
            'client' => 'erp',
        ]);

        $response->assertOk()
            ->assertJsonPath('status', 'verification_required')
            ->assertJsonPath('challenge.purpose', 'login')
            ->assertJsonPath('challenge.available_methods.0', 'email');
        $this->assertGuest();
    }

    public function test_tenant_owner_cannot_use_platform_admin_client(): void
    {
        [$user] = $this->member('organization_owner', true);

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'a sufficiently long employee passphrase',
            'client' => 'admin',
        ])->assertForbidden();
        $this->assertGuest();
    }

    public function test_invalid_password_response_is_generic(): void
    {
        [$user] = $this->member('employee', false);

        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'wrong'])
            ->assertUnauthorized()->assertJsonPath('message', 'Invalid email or password.');
        $this->postJson('/api/v1/auth/login', ['email' => 'missing@example.com', 'password' => 'wrong'])
            ->assertUnauthorized()->assertJsonPath('message', 'Invalid email or password.');
    }

    public function test_registration_verification_establishes_session_and_proceeds_to_onboarding(): void
    {
        $challenge = RegistrationChallenge::create([
            'id' => (string) Str::uuid(),
            'full_name' => 'New Owner',
            'email' => 'new-owner@example.com',
            'organization_name' => 'New Owner Company',
            'country' => 'BD',
            'password_hash' => Hash::make('a sufficiently long owner passphrase'),
            'terms_accepted' => true,
            'code_hash' => Hash::make('123456'),
            'expires_at' => now()->addMinutes(10),
            'resend_available_at' => now(),
            'client' => 'erp',
        ]);

        $response = $this->postJson('/api/v1/auth/registrations/'.$challenge->id.'/verify', [
            'code' => '123456',
        ]);

        $response->assertOk()
            ->assertJsonPath('status', 'authenticated')
            ->assertJsonPath('next', '/onboarding')
            ->assertJsonPath('organization.name', 'New Owner Company');

        $user = User::where('email', 'new-owner@example.com')->firstOrFail();
        $this->assertNotNull($user->email_verified_at);
        $this->assertAuthenticatedAs($user);
    }

    /** @return array{User, Organization, OrganizationMember} */
    private function member(string $roleName, bool $verifiedEmail): array
    {
        $organization = Organization::create(['name' => 'Acme', 'slug' => 'acme-'.uniqid(), 'status' => 'active']);
        $user = User::create([
            'name' => 'Security User',
            'email' => uniqid('user-').'@example.com',
            'password' => Hash::make('a sufficiently long employee passphrase'),
            'status' => 'active',
        ]);
        if ($verifiedEmail) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }
        $membership = OrganizationMember::create([
            'organization_id' => $organization->id,
            'user_id' => $user->id,
            'role' => 'compatibility-only',
            'status' => 'active',
            'data_scope' => 'ORGANIZATION',
            'activated_at' => now(),
        ]);
        $permission = Permission::firstOrCreate(['name' => 'organization.view'], ['description' => 'View organization']);
        $role = Role::firstOrCreate(['organization_id' => $organization->id, 'name' => $roleName], ['description' => $roleName]);
        $role->permissions()->syncWithoutDetaching([$permission->id]);
        $membership->roleAssignments()->create(['role_id' => $role->id, 'scope' => 'ORGANIZATION', 'reason' => 'test']);

        return [$user, $organization, $membership];
    }
}
