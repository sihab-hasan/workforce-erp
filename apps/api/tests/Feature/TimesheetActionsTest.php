<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Organization;
use App\Models\Timesheet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TimesheetActionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_linked_employee_can_clock_in_and_clock_out_through_live_api(): void
    {
        $organization = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
        $user = User::create([
            'name' => 'Worker',
            'email' => 'worker@example.com',
            'password' => Hash::make('password'),
        ]);
        $organization->members()->attach($user->id, ['role' => 'staff', 'status' => 'active']);
        $employee = Employee::create([
            'organization_id' => $organization->id,
            'user_id' => $user->id,
            'employee_id' => 'EMP-001',
            'first_name' => 'Work',
            'last_name' => 'Er',
            'email' => 'worker@example.com',
            'hire_date' => '2026-01-01',
            'status' => 'active',
            'employment_type' => 'full-time',
        ]);
        $token = $user->createToken('test')->plainTextToken;
        $headers = ['Authorization' => "Bearer {$token}"];

        Carbon::setTestNow('2026-08-16 09:00:00');
        $clockIn = $this->withHeaders($headers)->postJson('/api/v1/timesheets/clock-in');
        $clockIn->assertCreated()
            ->assertJsonPath('data.employee_id', (string) $employee->id)
            ->assertJsonPath('data.organization_id', (string) $organization->id);

        $this->withHeaders($headers)->getJson('/api/v1/timesheets/today')
            ->assertOk()
            ->assertJsonPath('data.is_clocked_in', true);

        Carbon::setTestNow('2026-08-16 17:00:00');
        $this->withHeaders($headers)->postJson('/api/v1/timesheets/clock-out')
            ->assertOk()
            ->assertJsonPath('data.total_hours', 8);

        $this->withHeaders($headers)->getJson('/api/v1/timesheets/today')
            ->assertOk()
            ->assertJsonPath('data.is_clocked_in', false)
            ->assertJsonPath('data.total_today_hours', 8);

        Carbon::setTestNow();
    }

    public function test_staff_cannot_clock_or_list_another_employee_timesheet(): void
    {
        $organization = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
        $user = User::create([
            'name' => 'Worker',
            'email' => 'worker@example.com',
            'password' => Hash::make('password'),
        ]);
        $organization->members()->attach($user->id, ['role' => 'staff', 'status' => 'active']);

        $ownEmployee = Employee::create([
            'organization_id' => $organization->id,
            'user_id' => $user->id,
            'employee_id' => 'EMP-001',
            'first_name' => 'Own',
            'last_name' => 'Profile',
            'email' => 'own@example.com',
            'hire_date' => '2026-01-01',
            'status' => 'active',
            'employment_type' => 'full-time',
        ]);
        $otherEmployee = Employee::create([
            'organization_id' => $organization->id,
            'employee_id' => 'EMP-002',
            'first_name' => 'Other',
            'last_name' => 'Employee',
            'email' => 'other@example.com',
            'hire_date' => '2026-01-01',
            'status' => 'active',
            'employment_type' => 'full-time',
        ]);

        Timesheet::create([
            'organization_id' => $organization->id,
            'employee_id' => $ownEmployee->id,
            'date' => '2026-08-15',
            'clock_in' => '2026-08-15 09:00:00',
            'clock_out' => '2026-08-15 17:00:00',
            'total_hours' => 8,
            'status' => 'present',
        ]);
        Timesheet::create([
            'organization_id' => $organization->id,
            'employee_id' => $otherEmployee->id,
            'date' => '2026-08-15',
            'clock_in' => '2026-08-15 09:00:00',
            'clock_out' => '2026-08-15 17:00:00',
            'total_hours' => 8,
            'status' => 'present',
        ]);

        $token = $user->createToken('test')->plainTextToken;
        $headers = ['Authorization' => "Bearer {$token}"];

        $this->withHeaders($headers)
            ->getJson('/api/v1/timesheets')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.employee_id', (string) $ownEmployee->id);

        $this->withHeaders($headers)
            ->postJson('/api/v1/timesheets/clock-in', ['employee_id' => $otherEmployee->id])
            ->assertForbidden();
    }

    public function test_live_clock_actions_reject_client_supplied_timestamps(): void
    {
        $organization = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
        $user = User::create([
            'name' => 'Worker',
            'email' => 'strict-clock@example.com',
            'password' => Hash::make('password'),
        ]);
        $organization->members()->attach($user->id, ['role' => 'staff', 'status' => 'active']);
        Employee::create([
            'organization_id' => $organization->id,
            'user_id' => $user->id,
            'employee_id' => 'EMP-STRICT',
            'first_name' => 'Strict',
            'last_name' => 'Clock',
            'email' => 'strict-clock@example.com',
            'hire_date' => '2026-01-01',
            'status' => 'active',
            'employment_type' => 'full-time',
        ]);

        $token = $user->createToken('test')->plainTextToken;
        $headers = ['Authorization' => "Bearer {$token}"];

        $this->withHeaders($headers)
            ->postJson('/api/v1/timesheets/clock-in', ['clock_in' => '2026-01-01 00:00:00'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['clock_in']);

        $this->withHeaders($headers)
            ->postJson('/api/v1/timesheets/clock-out', ['clock_out' => '2026-01-01 00:00:00'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['clock_out']);
    }
}
