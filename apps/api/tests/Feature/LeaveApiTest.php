<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\Organization;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LeaveApiTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;

    private LeaveType $leaveType;

    private Employee $employee;

    protected function setUp(): void
    {
        parent::setUp();

        $this->organization = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
        $this->leaveType = LeaveType::create([
            'organization_id' => $this->organization->id,
            'name' => 'Annual Leave',
            'code' => 'ANNUAL',
            'annual_allowance' => 10,
            'is_paid' => true,
            'is_active' => true,
        ]);
    }

    /** Monday of the week containing June 1st of the current year. */
    private function juneMonday(): Carbon
    {
        return Carbon::create(now()->year, 6, 1)->startOfWeek();
    }

    private function createUser(string $email, string $role = 'staff'): User
    {
        $user = User::create([
            'name' => explode('@', $email)[0],
            'email' => $email,
            'password' => Hash::make('password'),
        ]);
        $this->organization->members()->attach($user->id, ['role' => $role, 'status' => 'active']);

        return $user;
    }

    private function createEmployee(?User $user = null, string $code = 'EMP-001'): Employee
    {
        return Employee::create([
            'organization_id' => $this->organization->id,
            'user_id' => $user?->id,
            'employee_id' => $code,
            'first_name' => 'Test',
            'last_name' => 'Employee',
            'email' => $user?->email ?? strtolower($code).'@example.com',
            'hire_date' => '2026-01-01',
            'status' => 'active',
            'employment_type' => 'full-time',
        ]);
    }

    private function createLeaveRecord(Employee $employee, array $overrides = []): LeaveRequest
    {
        $monday = $this->juneMonday();

        return LeaveRequest::create(array_merge([
            'organization_id' => $this->organization->id,
            'employee_id' => $employee->id,
            'leave_type_id' => $this->leaveType->id,
            'start_date' => $monday->toDateString(),
            'end_date' => $monday->copy()->addDays(2)->toDateString(),
            'total_days' => 3,
            'status' => 'pending',
        ], $overrides));
    }

    private function headers(User $user): array
    {
        return ['Authorization' => 'Bearer '.$user->createToken('test')->plainTextToken];
    }

    /** Grants the custom-role permissions needed to review leaves and list approvals. */
    private function grantReviewerPermissions(User $user): void
    {
        $member = DB::table('organization_members')
            ->where('organization_id', $this->organization->id)
            ->where('user_id', $user->id)
            ->first();

        $permissionIds = collect(['leave.approve', 'approval.view', 'approval.approve'])
            ->map(fn (string $name) => Permission::query()->where('name', $name)->firstOrFail()->id)
            ->all();

        $role = Role::create(['organization_id' => $this->organization->id, 'name' => 'leave_reviewer']);
        $role->permissions()->attach($permissionIds);

        DB::table('membership_role_assignments')->insert([
            'organization_member_id' => $member->id,
            'role_id' => $role->id,
            'scope' => 'ORGANIZATION',
            'scope_data' => null,
            'starts_at' => null,
            'expires_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function test_leave_creation_succeeds_when_within_balance(): void
    {
        $user = $this->createUser('staff@example.com');
        $this->employee = $this->createEmployee($user);
        $monday = $this->juneMonday();

        $response = $this->withHeaders($this->headers($user))->postJson('/api/v1/leave-requests', [
            'leave_type_id' => $this->leaveType->id,
            'start_date' => $monday->toDateString(),
            'end_date' => $monday->copy()->addDays(2)->toDateString(),
            'reason' => 'Family event',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.total_days', 3)
            ->assertJsonPath('data.leave_type.name', 'Annual Leave');

        $this->assertDatabaseHas('leave_requests', [
            'employee_id' => $this->employee->id,
            'status' => 'pending',
        ]);
    }

    public function test_total_days_excludes_weekends(): void
    {
        $user = $this->createUser('staff@example.com');
        $this->createEmployee($user);
        $friday = $this->juneMonday()->copy()->addDays(4);
        $nextMonday = $friday->copy()->addDays(3);

        $this->withHeaders($this->headers($user))->postJson('/api/v1/leave-requests', [
            'leave_type_id' => $this->leaveType->id,
            'start_date' => $friday->toDateString(),
            'end_date' => $nextMonday->toDateString(),
        ])->assertStatus(201)
            ->assertJsonPath('data.total_days', 2);
    }

    public function test_leave_creation_fails_when_exceeding_annual_balance(): void
    {
        $user = $this->createUser('staff@example.com');
        $this->employee = $this->createEmployee($user);
        $monday = $this->juneMonday();

        // Allowance is 10; nine approved days already consumed earlier in the year.
        $this->createLeaveRecord($this->employee, [
            'start_date' => $monday->copy()->addWeeks(2)->toDateString(),
            'end_date' => $monday->copy()->addWeeks(2)->addDays(8)->toDateString(),
            'total_days' => 9,
            'status' => 'approved',
        ]);

        $response = $this->withHeaders($this->headers($user))->postJson('/api/v1/leave-requests', [
            'leave_type_id' => $this->leaveType->id,
            'start_date' => $monday->copy()->addWeeks(4)->toDateString(),
            'end_date' => $monday->copy()->addWeeks(4)->addDays(1)->toDateString(),
        ]);

        $response->assertStatus(422)
            ->assertExactJson([
                'message' => 'Insufficient leave balance. Requested: 2 days, Remaining: 1 days.',
            ]);

        $this->assertDatabaseCount('leave_requests', 1);
    }

    public function test_leave_creation_fails_on_overlapping_date_range(): void
    {
        $user = $this->createUser('staff@example.com');
        $this->employee = $this->createEmployee($user);
        $monday = $this->juneMonday();

        $this->createLeaveRecord($this->employee);

        $this->withHeaders($this->headers($user))->postJson('/api/v1/leave-requests', [
            'leave_type_id' => $this->leaveType->id,
            'start_date' => $monday->copy()->addDays(2)->toDateString(),
            'end_date' => $monday->copy()->addDays(4)->toDateString(),
        ])->assertStatus(409);
    }

    public function test_owner_can_cancel_own_pending_leave(): void
    {
        $user = $this->createUser('staff@example.com');
        $this->employee = $this->createEmployee($user);
        $leave = $this->createLeaveRecord($this->employee);

        $this->withHeaders($this->headers($user))
            ->patchJson("/api/v1/leave-requests/{$leave->id}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertDatabaseHas('leave_requests', ['id' => $leave->id, 'status' => 'cancelled']);
    }

    public function test_reviewed_leave_cannot_be_cancelled(): void
    {
        $user = $this->createUser('staff@example.com');
        $this->employee = $this->createEmployee($user);
        $approved = $this->createLeaveRecord($this->employee, ['status' => 'approved']);
        $rejected = $this->createLeaveRecord($this->employee, [
            'status' => 'rejected',
            'start_date' => $this->juneMonday()->copy()->addWeeks(3)->toDateString(),
            'end_date' => $this->juneMonday()->copy()->addWeeks(3)->addDays(1)->toDateString(),
        ]);

        $headers = $this->headers($user);

        $this->withHeaders($headers)
            ->patchJson("/api/v1/leave-requests/{$approved->id}/cancel")
            ->assertStatus(409);

        $this->withHeaders($headers)
            ->patchJson("/api/v1/leave-requests/{$rejected->id}/cancel")
            ->assertStatus(409);
    }

    public function test_approval_workflow_through_leave_and_approvals_endpoints(): void
    {
        $requester = $this->createUser('requester@example.com');
        $this->employee = $this->createEmployee($requester);
        $reviewer = $this->createUser('reviewer@example.com');
        $this->grantReviewerPermissions($reviewer);
        $monday = $this->juneMonday();

        $created = $this->withHeaders($this->headers($requester))->postJson('/api/v1/leave-requests', [
            'leave_type_id' => $this->leaveType->id,
            'start_date' => $monday->toDateString(),
            'end_date' => $monday->copy()->addDays(1)->toDateString(),
        ])->assertStatus(201);
        $leaveId = $created->json('data.id');

        // The pending request shows up in the approvals inbox for the reviewer.
        // Reset cached auth guards so the next request authenticates as the reviewer.
        auth()->forgetGuards();
        $reviewerHeaders = $this->headers($reviewer);
        $inbox = $this->withHeaders($reviewerHeaders)->getJson('/api/v1/approvals');
        $inbox
            ->assertOk()
            ->assertJsonFragment(['id' => 'leave-'.$leaveId, 'type' => 'leave', 'status' => 'pending']);

        // Approving through the leave endpoint reviews the request.
        $this->withHeaders($reviewerHeaders)
            ->patchJson("/api/v1/leave-requests/{$leaveId}/approve", ['review_note' => 'Approved for now'])
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('leave_requests', [
            'id' => $leaveId,
            'status' => 'approved',
            'reviewed_by' => $reviewer->id,
        ]);

        // Once reviewed, it disappears from the approvals inbox.
        $this->withHeaders($reviewerHeaders)->getJson('/api/v1/approvals')
            ->assertOk()
            ->assertJsonMissing(['id' => 'leave-'.$leaveId]);
    }

    public function test_requester_cannot_approve_own_leave(): void
    {
        $user = $this->createUser('requester@example.com', 'admin');
        $this->employee = $this->createEmployee($user);
        $leave = $this->createLeaveRecord($this->employee);

        $this->withHeaders($this->headers($user))
            ->patchJson("/api/v1/leave-requests/{$leave->id}/approve")
            ->assertStatus(409);
    }
}
