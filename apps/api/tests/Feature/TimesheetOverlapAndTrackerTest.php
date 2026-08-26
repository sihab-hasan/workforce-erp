<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Employee;
use App\Models\Organization;
use App\Models\Timesheet;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TimesheetOverlapAndTrackerTest extends TestCase
{
    use RefreshDatabase;

    protected Organization $organization;
    protected Employee $employee;
    protected User $user;
    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->organization = Organization::create([
            'name' => 'Acme Corp',
            'slug' => 'acme-corp',
        ]);

        $this->user = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('password'),
        ]);

        $this->organization->members()->attach($this->user->id, [
            'role' => 'admin',
            'status' => 'active',
        ]);

        $branch = Branch::create([
            'organization_id' => $this->organization->id,
            'name' => 'HQ',
            'code' => 'HQ-01',
        ]);

        $department = Department::create([
            'organization_id' => $this->organization->id,
            'name' => 'Engineering',
        ]);

        $designation = Designation::create([
            'organization_id' => $this->organization->id,
            'name' => 'Software Engineer',
        ]);

        $this->employee = Employee::create([
            'organization_id' => $this->organization->id,
            'user_id' => $this->user->id,
            'branch_id' => $branch->id,
            'department_id' => $department->id,
            'designation_id' => $designation->id,
            'employee_id' => 'EMP-001',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'status' => 'active',
            'hire_date' => '2026-01-01',
        ]);

        \Laravel\Sanctum\Sanctum::actingAs($this->user);
    }

    /**
     * Helper to authenticate requests.
     */
    protected function authHeaders(): array
    {
        return [
            'Accept' => 'application/json',
            'X-API-TOKEN' => 'my-secret-token',
        ];
    }

    /**
     * Test clock-in creates an open work session.
     */
    public function test_employee_can_clock_in(): void
    {
        $response = $this->withHeaders($this->authHeaders())->postJson('/api/v1/timesheets/clock-in', [
            'employee_id' => $this->employee->id,
            'clock_in' => '2026-08-26 09:00:00',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Clocked in successfully',
                'data' => [
                    'employee_id' => (string) $this->employee->id,
                    'clock_out' => null,
                ],
            ]);

        $this->assertDatabaseHas('timesheets', [
            'employee_id' => $this->employee->id,
            'clock_out' => null,
        ]);
    }

    /**
     * Test cannot start a new work session if an open session already exists.
     */
    public function test_cannot_clock_in_if_open_session_already_exists(): void
    {
        // First clock-in
        Timesheet::create([
            'organization_id' => $this->organization->id,
            'employee_id' => $this->employee->id,
            'date' => '2026-08-26',
            'clock_in' => '2026-08-26 09:00:00',
            'clock_out' => null,
            'total_hours' => 0.00,
            'status' => 'present',
        ]);

        // Attempt second clock-in
        $response = $this->withHeaders($this->authHeaders())->postJson('/api/v1/timesheets/clock-in', [
            'employee_id' => $this->employee->id,
            'clock_in' => '2026-08-26 10:00:00',
        ]);

        $response->assertStatus(409)
            ->assertJson([
                'success' => false,
                'message' => 'An active work session is already in progress. Please clock out before starting a new session.',
            ]);

        // Assert only one active session exists
        $this->assertEquals(1, Timesheet::where('employee_id', $this->employee->id)->whereNull('clock_out')->count());
    }

    /**
     * Test employee can clock out from active session and hours are computed correctly.
     */
    public function test_employee_can_clock_out_and_calculate_total_hours(): void
    {
        Timesheet::create([
            'organization_id' => $this->organization->id,
            'employee_id' => $this->employee->id,
            'date' => '2026-08-26',
            'clock_in' => '2026-08-26 09:00:00',
            'clock_out' => null,
            'total_hours' => 0.00,
            'status' => 'present',
        ]);

        $response = $this->withHeaders($this->authHeaders())->postJson('/api/v1/timesheets/clock-out', [
            'employee_id' => $this->employee->id,
            'clock_out' => '2026-08-26 17:30:00',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Clocked out successfully',
                'data' => [
                    'employee_id' => (string) $this->employee->id,
                    'total_hours' => 8.50,
                ],
            ]);

        $this->assertDatabaseHas('timesheets', [
            'employee_id' => $this->employee->id,
            'total_hours' => 8.50,
        ]);
    }

    /**
     * Test manual timesheet entry is rejected when overlapping existing closed span.
     */
    public function test_manual_entry_rejected_when_overlapping_existing_record(): void
    {
        // Existing shift: 09:00 to 13:00
        Timesheet::create([
            'organization_id' => $this->organization->id,
            'employee_id' => $this->employee->id,
            'date' => '2026-08-26',
            'clock_in' => '2026-08-26 09:00:00',
            'clock_out' => '2026-08-26 13:00:00',
            'total_hours' => 4.00,
            'status' => 'present',
        ]);

        // Attempt overlapping entry: 11:00 to 15:00
        $response = $this->withHeaders($this->authHeaders())->postJson('/api/v1/timesheets', [
            'employee_id' => $this->employee->id,
            'organization_id' => $this->organization->id,
            'date' => '2026-08-26',
            'clock_in' => '2026-08-26 11:00:00',
            'clock_out' => '2026-08-26 15:00:00',
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'success',
                'message',
                'errors' => ['time_span'],
            ]);

        // Attempt another overlapping entry completely enclosing the existing record: 08:00 to 14:00
        $response2 = $this->withHeaders($this->authHeaders())->postJson('/api/v1/timesheets', [
            'employee_id' => $this->employee->id,
            'organization_id' => $this->organization->id,
            'date' => '2026-08-26',
            'clock_in' => '2026-08-26 08:00:00',
            'clock_out' => '2026-08-26 14:00:00',
        ]);

        $response2->assertStatus(422);

        // Attempt another overlapping entry completely inside the existing record: 10:00 to 12:00
        $response3 = $this->withHeaders($this->authHeaders())->postJson('/api/v1/timesheets', [
            'employee_id' => $this->employee->id,
            'organization_id' => $this->organization->id,
            'date' => '2026-08-26',
            'clock_in' => '2026-08-26 10:00:00',
            'clock_out' => '2026-08-26 12:00:00',
        ]);

        $response3->assertStatus(422);
    }

    /**
     * Test manual entry rejected when overlapping an active open session.
     */
    public function test_manual_entry_rejected_when_overlapping_active_open_session(): void
    {
        Timesheet::create([
            'organization_id' => $this->organization->id,
            'employee_id' => $this->employee->id,
            'date' => '2026-08-26',
            'clock_in' => '2026-08-26 14:00:00',
            'clock_out' => null,
            'total_hours' => 0.00,
            'status' => 'present',
        ]);

        // Attempting an entry that ends at 15:00 (after active session started at 14:00)
        $response = $this->withHeaders($this->authHeaders())->postJson('/api/v1/timesheets', [
            'employee_id' => $this->employee->id,
            'organization_id' => $this->organization->id,
            'date' => '2026-08-26',
            'clock_in' => '2026-08-26 13:00:00',
            'clock_out' => '2026-08-26 15:00:00',
        ]);

        $response->assertStatus(409)
            ->assertJson([
                'success' => false,
                'message' => 'The specified time span overlaps with the current active open session.',
            ]);
    }

    /**
     * Test multiple non-overlapping entries on the same date are allowed.
     */
    public function test_multiple_non_overlapping_entries_on_same_date_are_allowed(): void
    {
        // First shift: 08:00 to 12:00 (4 hrs)
        $shift1 = $this->withHeaders($this->authHeaders())->postJson('/api/v1/timesheets', [
            'employee_id' => $this->employee->id,
            'organization_id' => $this->organization->id,
            'date' => '2026-08-26',
            'clock_in' => '2026-08-26 08:00:00',
            'clock_out' => '2026-08-26 12:00:00',
        ]);
        $shift1->assertStatus(201);

        // Second shift: 13:00 to 17:00 (4 hrs)
        $shift2 = $this->withHeaders($this->authHeaders())->postJson('/api/v1/timesheets', [
            'employee_id' => $this->employee->id,
            'organization_id' => $this->organization->id,
            'date' => '2026-08-26',
            'clock_in' => '2026-08-26 13:00:00',
            'clock_out' => '2026-08-26 17:00:00',
        ]);
        $shift2->assertStatus(201);

        $this->assertEquals(2, Timesheet::where('employee_id', $this->employee->id)->whereDate('date', '2026-08-26')->count());
    }

    /**
     * Test today status endpoint returns active session, tracked time, scheduled time, and remaining time.
     */
    public function test_today_status_returns_active_session_and_remaining_scheduled_time(): void
    {
        // Morning session completed (3.5 hours: 08:00 to 11:30)
        Timesheet::create([
            'organization_id' => $this->organization->id,
            'employee_id' => $this->employee->id,
            'date' => '2026-08-26',
            'clock_in' => '2026-08-26 08:00:00',
            'clock_out' => '2026-08-26 11:30:00',
            'total_hours' => 3.50,
            'status' => 'present',
        ]);

        $response = $this->withHeaders($this->authHeaders())->getJson("/api/v1/timesheets/today?employee_id={$this->employee->id}&date=2026-08-26");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'is_clocked_in' => false,
                    'active_timesheet' => null,
                    'today' => '2026-08-26',
                    'total_today_hours' => 3.50,
                    'scheduled_hours' => 8.00,
                    'remaining_hours' => 4.50,
                ],
            ]);
    }
}
