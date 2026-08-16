<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Employee;
use App\Models\Organization;
use App\Models\Timesheet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PaginationTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Organization $organization;

    protected Branch $branch;

    protected Department $department;

    protected Designation $designation;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Create Organization
        $this->organization = Organization::create([
            'name' => 'Test Corp',
            'slug' => 'test-corp',
            'subdomain' => 'test',
        ]);

        // 2. Create User
        $this->user = User::create([
            'name' => 'Main Admin',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
        ]);

        // 3. Attach User to Organization
        $this->organization->members()->attach($this->user->id, [
            'role' => 'admin',
            'status' => 'active',
        ]);

        // 4. Create Branch, Department, Designation
        $this->branch = Branch::create([
            'organization_id' => $this->organization->id,
            'name' => 'Central Branch',
            'code' => 'CB',
        ]);

        $this->department = Department::create([
            'organization_id' => $this->organization->id,
            'branch_id' => $this->branch->id,
            'name' => 'Technology',
            'code' => 'TECH',
        ]);

        $this->designation = Designation::create([
            'organization_id' => $this->organization->id,
            'name' => 'Developer',
            'code' => 'DEV',
        ]);
    }

    /**
     * Test paginated User listing, including search, role/status filters, and metadata.
     */
    public function test_users_pagination_and_filtering(): void
    {
        // Create 20 more users and link them to the organization with different roles/statuses
        for ($i = 1; $i <= 20; $i++) {
            $u = User::create([
                'name' => "User {$i}",
                'email' => "user{$i}@test.com",
                'password' => Hash::make('password'),
            ]);

            $role = $i % 2 === 0 ? 'manager' : 'staff';
            $status = $i % 3 === 0 ? 'suspended' : 'active';

            $this->organization->members()->attach($u->id, [
                'role' => $role,
                'status' => $status,
            ]);
        }

        // Test GET /api/v1/users with page=1 & per_page=5
        $token = $this->user->createToken('test_token')->plainTextToken;
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/v1/users?page=1&per_page=5');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id', 'name', 'email', 'role', 'status',
                        'organization_id', 'organization_name',
                        'employee_id', 'employee_name', 'created_at', 'updated_at',
                    ],
                ],
                'meta' => ['current_page', 'from', 'last_page', 'path', 'per_page', 'to', 'total'],
                'links' => ['first', 'last', 'prev', 'next'],
            ])
            ->assertJson([
                'success' => true,
                'meta' => [
                    'current_page' => 1,
                    'per_page' => 5,
                    'total' => 21, // 20 new users + 1 main admin user
                ],
            ]);

        // Verify page size is respected (should return 5 items)
        $this->assertCount(5, $response->json()['data']);

        // Test Filter by Role (manager)
        $responseRole = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/v1/users?role=manager');

        $responseRole->assertStatus(200);
        foreach ($responseRole->json()['data'] as $userData) {
            $this->assertEquals('manager', $userData['role']);
        }

        // Test Filter by Status (suspended)
        $responseStatus = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/v1/users?status=suspended');

        $responseStatus->assertStatus(200);
        foreach ($responseStatus->json()['data'] as $userData) {
            $this->assertEquals('suspended', $userData['status']);
        }

        // Test Search parameter
        $responseSearch = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/v1/users?search=User 10');

        $responseSearch->assertStatus(200)
            ->assertJsonFragment(['name' => 'User 10']);
        $this->assertCount(1, $responseSearch->json()['data']);
    }

    /**
     * Test paginated Employee listing, including search, department, location, and status filters.
     */
    public function test_employees_pagination_and_filtering(): void
    {
        // Create another department and location for testing filters
        $marketingDept = Department::create([
            'organization_id' => $this->organization->id,
            'branch_id' => $this->branch->id,
            'name' => 'Marketing',
            'code' => 'MKT',
        ]);

        $londonBranch = Branch::create([
            'organization_id' => $this->organization->id,
            'name' => 'London',
            'code' => 'LDN',
        ]);

        // Create 15 employees
        for ($i = 1; $i <= 15; $i++) {
            Employee::create([
                'organization_id' => $this->organization->id,
                'employee_id' => "EMP-10{$i}",
                'first_name' => "FirstName{$i}",
                'last_name' => "LastName{$i}",
                'email' => "employee{$i}@test.com",
                'hire_date' => '2026-01-01',
                'department_id' => $i % 2 === 0 ? $this->department->id : $marketingDept->id,
                'branch_id' => $i % 3 === 0 ? $this->branch->id : $londonBranch->id,
                'designation_id' => $this->designation->id,
                'status' => $i % 2 === 0 ? 'active' : 'on-leave',
            ]);
        }

        $token = $this->user->createToken('test_token')->plainTextToken;

        // Test GET /api/v1/employees
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/v1/employees?page=2&per_page=5');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'meta' => [
                    'current_page' => 2,
                    'per_page' => 5,
                    'total' => 15,
                ],
            ]);
        $this->assertCount(5, $response->json()['data']);

        // Verify initials are present and correct (e.g. FirstName1 LastName1 -> FL)
        $firstItem = $response->json()['data'][0];
        $this->assertEquals(2, strlen($firstItem['initials']));

        // Test filter by department (Marketing)
        $responseDept = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/v1/employees?department=Marketing');

        $responseDept->assertStatus(200);
        foreach ($responseDept->json()['data'] as $emp) {
            $this->assertEquals('Marketing', $emp['department']);
        }

        // Test filter by branch/location (London)
        $responseLoc = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/v1/employees?location=London');

        $responseLoc->assertStatus(200);
        foreach ($responseLoc->json()['data'] as $emp) {
            $this->assertEquals('London', $emp['location']);
        }

        // Test filter by status (on-leave)
        $responseStatus = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/v1/employees?status=on-leave');

        $responseStatus->assertStatus(200);
        foreach ($responseStatus->json()['data'] as $emp) {
            $this->assertEquals('on-leave', $emp['status']);
        }

        // Test search
        $responseSearch = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/v1/employees?search=FirstName5');

        $responseSearch->assertStatus(200);
        $this->assertCount(1, $responseSearch->json()['data']);
        $this->assertEquals('FirstName5 LastName5', $responseSearch->json()['data'][0]['name']);
    }

    /**
     * Test paginated Timesheet listing, including search, date range, status, and employee filters.
     */
    public function test_timesheets_pagination_and_filtering(): void
    {
        // Create an employee
        $emp = Employee::create([
            'organization_id' => $this->organization->id,
            'employee_id' => 'EMP-777',
            'first_name' => 'Alice',
            'last_name' => 'Smith',
            'email' => 'alice@test.com',
            'hire_date' => '2026-01-01',
            'department_id' => $this->department->id,
            'branch_id' => $this->branch->id,
            'designation_id' => $this->designation->id,
        ]);

        // Create another employee for filter comparisons
        $emp2 = Employee::create([
            'organization_id' => $this->organization->id,
            'employee_id' => 'EMP-888',
            'first_name' => 'Bob',
            'last_name' => 'Jones',
            'email' => 'bob@test.com',
            'hire_date' => '2026-01-01',
            'department_id' => $this->department->id,
            'branch_id' => $this->branch->id,
            'designation_id' => $this->designation->id,
        ]);

        // Create timesheet logs over 10 days for Alice
        for ($i = 1; $i <= 10; $i++) {
            $date = sprintf('2026-08-%02d', $i);
            Timesheet::create([
                'organization_id' => $this->organization->id,
                'employee_id' => $emp->id,
                'date' => $date,
                'clock_in' => "{$date} 09:00:00",
                'clock_out' => "{$date} 17:00:00",
                'total_hours' => 8.00,
                'status' => $i % 3 === 0 ? 'pending' : 'present',
            ]);
        }

        // Create 5 timesheet logs for Bob
        for ($i = 1; $i <= 5; $i++) {
            $date = sprintf('2026-08-%02d', $i + 10);
            Timesheet::create([
                'organization_id' => $this->organization->id,
                'employee_id' => $emp2->id,
                'date' => $date,
                'clock_in' => "{$date} 09:00:00",
                'clock_out' => "{$date} 17:00:00",
                'total_hours' => 8.00,
                'status' => 'present',
            ]);
        }

        $token = $this->user->createToken('test_token')->plainTextToken;

        // Test GET /api/v1/timesheets
        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/v1/timesheets?page=1&per_page=6');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'meta' => [
                    'current_page' => 1,
                    'per_page' => 6,
                    'total' => 15,
                ],
            ]);
        $this->assertCount(6, $response->json()['data']);

        // Test filter by employee_id (Bob's records only)
        $responseBob = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson("/api/v1/timesheets?employee_id={$emp2->id}");

        $responseBob->assertStatus(200);
        $this->assertCount(5, $responseBob->json()['data']);
        foreach ($responseBob->json()['data'] as $log) {
            $this->assertEquals($emp2->id, $log['employee_id']);
        }

        // Test search by employee name (Alice)
        $responseSearch = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/v1/timesheets?search=Alice');

        $responseSearch->assertStatus(200);
        $this->assertCount(10, $responseSearch->json()['data']);

        // Test date range filter (start_date=2026-08-05 & end_date=2026-08-12)
        $responseDates = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/v1/timesheets?start_date=2026-08-05&end_date=2026-08-12');

        $responseDates->assertStatus(200);
        $this->assertCount(8, $responseDates->json()['data']);

        // Test filter by status (pending)
        $responseStatus = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/v1/timesheets?status=pending');

        $responseStatus->assertStatus(200);
        $this->assertCount(3, $responseStatus->json()['data']);
    }
}
