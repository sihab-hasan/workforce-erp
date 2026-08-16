<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class UsersApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_invite_update_and_deactivate_user_in_own_organization(): void
    {
        Mail::fake();
        $organization = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);
        $organization->members()->attach($admin->id, ['role' => 'admin', 'status' => 'active']);

        $employee = Employee::create([
            'organization_id' => $organization->id,
            'employee_id' => 'EMP-001',
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane@example.com',
            'hire_date' => '2026-08-01',
            'status' => 'active',
            'employment_type' => 'full-time',
        ]);

        $token = $admin->createToken('test')->plainTextToken;
        $headers = ['Authorization' => "Bearer {$token}"];

        $invite = $this->withHeaders($headers)->postJson('/api/v1/users', [
            'name' => 'Jane Doe',
            'email' => 'jane.user@example.com',
            'role' => 'staff',
            'organization_id' => $organization->id,
            'employee_id' => $employee->id,
        ]);

        $invite->assertCreated()
            ->assertJsonPath('data.status', 'invited')
            ->assertJsonPath('data.employee.employee_id', (string) $employee->id);

        $userId = $invite->json('data.id');

        $this->withHeaders($headers)->putJson("/api/v1/users/{$userId}", [
            'name' => 'Jane Updated',
            'role' => 'manager',
            'organization_id' => $organization->id,
        ])->assertOk()
            ->assertJsonPath('data.name', 'Jane Updated')
            ->assertJsonPath('data.role', 'manager');

        $this->withHeaders($headers)->patchJson("/api/v1/users/{$userId}/deactivate")
            ->assertOk()
            ->assertJsonPath('data.status', 'inactive');
    }

    public function test_user_without_memberships_cannot_access_users_directory(): void
    {
        User::factory()->count(3)->create();
        $outsider = User::factory()->create();
        $token = $outsider->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/users')
            ->assertForbidden();
    }

    public function test_staff_membership_cannot_access_users_directory(): void
    {
        $organization = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
        $staff = User::factory()->create();
        $organization->members()->attach($staff->id, ['role' => 'staff', 'status' => 'active']);
        $organization->members()->attach(User::factory()->create()->id, ['role' => 'staff', 'status' => 'active']);
        $token = $staff->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/users')
            ->assertForbidden();
    }

    public function test_admin_cannot_assign_or_modify_owner_role(): void
    {
        Mail::fake();
        $organization = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
        $admin = User::factory()->create();
        $owner = User::factory()->create();
        $organization->members()->attach($admin->id, ['role' => 'admin', 'status' => 'active']);
        $organization->members()->attach($owner->id, ['role' => 'owner', 'status' => 'active']);
        $token = $admin->createToken('test')->plainTextToken;
        $headers = ['Authorization' => "Bearer {$token}"];

        $this->withHeaders($headers)->postJson('/api/v1/users', [
            'name' => 'Promoted User',
            'email' => 'promoted@example.com',
            'role' => 'owner',
            'organization_id' => $organization->id,
        ])->assertForbidden();

        $this->withHeaders($headers)
            ->patchJson("/api/v1/users/{$owner->id}/deactivate")
            ->assertForbidden();
    }

    public function test_last_active_owner_cannot_be_demoted_or_deactivated(): void
    {
        $organization = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
        $owner = User::factory()->create();
        $organization->members()->attach($owner->id, ['role' => 'owner', 'status' => 'active']);
        $token = $owner->createToken('test')->plainTextToken;
        $headers = ['Authorization' => "Bearer {$token}"];

        $this->withHeaders($headers)->putJson("/api/v1/users/{$owner->id}", [
            'role' => 'admin',
            'organization_id' => $organization->id,
        ])->assertStatus(409)->assertJsonPath(
            'message',
            'The organization must retain at least one active owner.'
        );

        $this->withHeaders($headers)
            ->patchJson("/api/v1/users/{$owner->id}/deactivate")
            ->assertStatus(409);
    }

    public function test_admin_can_list_search_filter_sort_and_paginate_users(): void
    {
        $organization = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
        $admin = User::factory()->create(['name' => 'Admin']);
        $organization->members()->attach($admin->id, ['role' => 'admin', 'status' => 'active']);

        $alice = User::factory()->create(['name' => 'Alice Example', 'email' => 'alice@example.com']);
        $bob = User::factory()->create(['name' => 'Bob Example', 'email' => 'bob@example.com']);
        $organization->members()->attach($alice->id, ['role' => 'manager', 'status' => 'active']);
        $organization->members()->attach($bob->id, ['role' => 'staff', 'status' => 'inactive']);

        $token = $admin->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/users?search=Alice&role=manager&status=active&per_page=1&sort_by=email&sort_direction=desc')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.email', 'alice@example.com')
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.total', 1);
    }

    public function test_admin_can_retrieve_and_update_basic_account_information(): void
    {
        $organization = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
        $admin = User::factory()->create();
        $target = User::factory()->create(['name' => 'Old Name', 'email' => 'old@example.com']);
        $organization->members()->attach($admin->id, ['role' => 'admin', 'status' => 'active']);
        $organization->members()->attach($target->id, ['role' => 'staff', 'status' => 'active']);
        $token = $admin->createToken('test')->plainTextToken;
        $headers = ['Authorization' => "Bearer {$token}"];

        $this->withHeaders($headers)
            ->getJson("/api/v1/users/{$target->id}")
            ->assertOk()
            ->assertJsonPath('data.email', 'old@example.com');

        $this->withHeaders($headers)
            ->putJson("/api/v1/users/{$target->id}", [
                'name' => 'New Name',
                'email' => 'NEW@example.com',
                'organization_id' => $organization->id,
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'New Name')
            ->assertJsonPath('data.email', 'new@example.com');

        $this->assertDatabaseHas('users', [
            'id' => $target->id,
            'name' => 'New Name',
            'email' => 'new@example.com',
        ]);
    }

    public function test_invite_defaults_to_first_manageable_organization_and_employee_link_is_optional(): void
    {
        Mail::fake();
        $organization = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
        $admin = User::factory()->create();
        $organization->members()->attach($admin->id, ['role' => 'admin', 'status' => 'active']);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/users', [
                'name' => 'Portal Only User',
                'email' => 'portal-only@example.com',
                'role' => 'readonly',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.organization_id', (string) $organization->id)
            ->assertJsonPath('data.employee', null)
            ->assertJsonPath('data.status', 'invited');
    }

    public function test_employee_cannot_be_linked_to_two_users_and_user_cannot_link_two_employees_in_same_organization(): void
    {
        Mail::fake();
        $organization = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
        $admin = User::factory()->create();
        $organization->members()->attach($admin->id, ['role' => 'admin', 'status' => 'active']);
        $token = $admin->createToken('test')->plainTextToken;
        $headers = ['Authorization' => "Bearer {$token}"];

        $employeeA = Employee::create([
            'organization_id' => $organization->id,
            'employee_id' => 'EMP-A',
            'first_name' => 'A',
            'last_name' => 'One',
            'email' => 'a.employee@example.com',
            'hire_date' => '2026-08-01',
            'status' => 'active',
            'employment_type' => 'full-time',
        ]);
        $employeeB = Employee::create([
            'organization_id' => $organization->id,
            'employee_id' => 'EMP-B',
            'first_name' => 'B',
            'last_name' => 'Two',
            'email' => 'b.employee@example.com',
            'hire_date' => '2026-08-01',
            'status' => 'active',
            'employment_type' => 'full-time',
        ]);

        $first = $this->withHeaders($headers)->postJson('/api/v1/users', [
            'name' => 'First User',
            'email' => 'first@example.com',
            'role' => 'staff',
            'organization_id' => $organization->id,
            'employee_id' => $employeeA->id,
        ])->assertCreated();

        $firstUserId = $first->json('data.id');

        $this->withHeaders($headers)->postJson('/api/v1/users', [
            'name' => 'Second User',
            'email' => 'second@example.com',
            'role' => 'staff',
            'organization_id' => $organization->id,
            'employee_id' => $employeeA->id,
        ])->assertStatus(409);

        // Update semantics intentionally move a user's employee link: the old link is
        // cleared before the new one is attached, preserving one link per organization.
        $this->withHeaders($headers)->putJson("/api/v1/users/{$firstUserId}", [
            'organization_id' => $organization->id,
            'employee_id' => $employeeB->id,
        ])->assertOk()->assertJsonPath('data.employee_id', (string) $employeeB->id);

        $this->assertDatabaseHas('employees', ['id' => $employeeA->id, 'user_id' => null]);
        $this->assertDatabaseHas('employees', ['id' => $employeeB->id, 'user_id' => $firstUserId]);
    }

    public function test_user_hard_delete_is_rejected_to_preserve_history(): void
    {
        $organization = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
        $admin = User::factory()->create();
        $target = User::factory()->create();
        $organization->members()->attach($admin->id, ['role' => 'admin', 'status' => 'active']);
        $organization->members()->attach($target->id, ['role' => 'staff', 'status' => 'active']);
        $token = $admin->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/v1/users/{$target->id}")
            ->assertStatus(409)
            ->assertJsonPath('message', 'User accounts cannot be permanently deleted. Deactivate the account to preserve audit and history data.');

        $this->assertDatabaseHas('users', ['id' => $target->id]);
    }

    public function test_resend_invitation_is_rejected_for_non_invited_account(): void
    {
        $organization = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
        $admin = User::factory()->create();
        $target = User::factory()->create();
        $organization->members()->attach($admin->id, ['role' => 'admin', 'status' => 'active']);
        $organization->members()->attach($target->id, ['role' => 'staff', 'status' => 'active']);
        $token = $admin->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/v1/users/{$target->id}/resend-invitation")
            ->assertStatus(409);
    }
}
