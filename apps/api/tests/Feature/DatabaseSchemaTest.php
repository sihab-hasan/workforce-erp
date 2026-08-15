<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Employee;
use App\Models\Organization;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Timesheet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DatabaseSchemaTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test database migrations, constraints, and relationships.
     */
    public function test_database_schema_relations_and_cascade_rules(): void
    {
        // 1. Create Organization and Users
        $org = Organization::create([
            'name' => 'Acme Corp',
            'slug' => 'acme-corp',
            'subdomain' => 'acme',
        ]);

        $this->assertDatabaseHas('organizations', ['id' => $org->id, 'slug' => 'acme-corp']);

        $user1 = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('password'),
        ]);

        $user2 = User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'password' => Hash::make('password'),
        ]);

        // 2. Organization Memberships
        $org->members()->attach($user1->id, ['role' => 'admin']);
        $org->members()->attach($user2->id, ['role' => 'member']);

        $this->assertDatabaseHas('organization_members', [
            'organization_id' => $org->id,
            'user_id' => $user1->id,
            'role' => 'admin',
        ]);

        $this->assertEquals(2, $org->members()->count());
        $this->assertEquals(1, $user1->organizations()->count());

        // 3. Branches, Departments, and Designations
        $branch = Branch::create([
            'organization_id' => $org->id,
            'name' => 'Headquarters',
            'code' => 'HQ',
        ]);

        $designation = Designation::create([
            'organization_id' => $org->id,
            'name' => 'Software Engineer',
            'code' => 'SWE',
        ]);

        $department = Department::create([
            'organization_id' => $org->id,
            'branch_id' => $branch->id,
            'name' => 'Engineering',
            'code' => 'ENG',
        ]);

        $this->assertDatabaseHas('branches', ['organization_id' => $org->id, 'name' => 'Headquarters']);
        $this->assertDatabaseHas('designations', ['organization_id' => $org->id, 'name' => 'Software Engineer']);
        $this->assertDatabaseHas('departments', ['organization_id' => $org->id, 'name' => 'Engineering']);

        // Test unique branch name within organization constraint
        try {
            Branch::create([
                'organization_id' => $org->id,
                'name' => 'Headquarters',
            ]);
            $this->fail('Expected unique constraint exception for branch name');
        } catch (\Illuminate\Database\QueryException $e) {
            $this->assertStringContainsString('UNIQUE constraint failed', $e->getMessage());
        }

        // 4. Employees (one linked to user, one not)
        $employee1 = Employee::create([
            'organization_id' => $org->id,
            'user_id' => $user1->id,
            'branch_id' => $branch->id,
            'department_id' => $department->id,
            'designation_id' => $designation->id,
            'employee_id' => 'EMP-001',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@acme.com',
            'hire_date' => now()->toDateString(),
            'status' => 'active',
        ]);

        // Employee 2 is not linked to a user account
        $employee2 = Employee::create([
            'organization_id' => $org->id,
            'user_id' => null,
            'branch_id' => $branch->id,
            'department_id' => $department->id,
            'designation_id' => $designation->id,
            'manager_id' => $employee1->id,
            'employee_id' => 'EMP-002',
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane.smith@acme.com',
            'hire_date' => now()->toDateString(),
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('employees', ['employee_id' => 'EMP-001', 'user_id' => $user1->id]);
        $this->assertDatabaseHas('employees', ['employee_id' => 'EMP-002', 'user_id' => null]);

        // Verify relationships
        $this->assertEquals($employee1->id, $employee2->manager->id);
        $this->assertEquals(1, $employee1->subordinates->count());

        // Update department head/manager
        $department->update(['manager_id' => $employee1->id]);
        $this->assertEquals($employee1->id, $department->fresh()->manager->id);

        // 5. Roles & Permissions
        $role = Role::create([
            'organization_id' => $org->id,
            'name' => 'Developer',
        ]);

        $permission = Permission::create([
            'name' => 'code.commit',
            'description' => 'Allowed to commit code',
        ]);

        $role->permissions()->attach($permission->id);
        $employee1->roles()->attach($role->id);

        $this->assertDatabaseHas('role_permissions', ['role_id' => $role->id, 'permission_id' => $permission->id]);
        $this->assertDatabaseHas('employee_roles', ['employee_id' => $employee1->id, 'role_id' => $role->id]);

        $this->assertEquals('code.commit', $employee1->roles()->first()->permissions()->first()->name);

        // 6. Timesheet logging
        $timesheet = Timesheet::create([
            'organization_id' => $org->id,
            'employee_id' => $employee1->id,
            'date' => now()->toDateString(),
            'clock_in' => now()->toDateTimeString(),
            'clock_out' => now()->addHours(8)->toDateTimeString(),
            'total_hours' => 8.00,
            'status' => 'present',
        ]);

        $this->assertDatabaseHas('timesheets', [
            'employee_id' => $employee1->id,
            'total_hours' => 8.00,
        ]);

        // 7. Soft Deletes
        $employee1->delete();
        $this->assertSoftDeleted('employees', ['id' => $employee1->id]);
        $this->assertNotNull($org->employees()->withTrashed()->find($employee1->id));

        // Restore employee
        $employee1->restore();
        $this->assertDatabaseHas('employees', ['id' => $employee1->id, 'deleted_at' => null]);

        // 8. User deletion sets user_id to null on Employee
        $user1->delete();
        $this->assertNull($employee1->fresh()->user_id);
        $this->assertDatabaseHas('employees', ['id' => $employee1->id]); // Employee is NOT deleted

        // 9. Cascade deletion of organization
        $org->delete(); // Soft delete organization
        $this->assertSoftDeleted('organizations', ['id' => $org->id]);

        $org->forceDelete(); // Hard delete organization to trigger database cascades
        $this->assertDatabaseMissing('organizations', ['id' => $org->id]);
        $this->assertDatabaseMissing('branches', ['organization_id' => $org->id]);
        $this->assertDatabaseMissing('departments', ['organization_id' => $org->id]);
        $this->assertDatabaseMissing('designations', ['organization_id' => $org->id]);
        $this->assertDatabaseMissing('employees', ['organization_id' => $org->id]);
        $this->assertDatabaseMissing('timesheets', ['organization_id' => $org->id]);
        $this->assertDatabaseMissing('roles', ['organization_id' => $org->id]);
    }
}
