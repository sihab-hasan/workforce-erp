<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Timesheet;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class TimesheetService
{
    public const STATUSES = ['present', 'absent', 'on-leave', 'half-day', 'pending', 'approved', 'rejected'];

    public function __construct(private readonly AuthorizationService $authz, private readonly DataScopeService $dataScope) {}

    public function paginate(User $actor, array $filters): LengthAwarePaginator
    {
        $orgId = (int) ($filters['organization_id'] ?? 0);
        if (! $orgId) {
            abort(400, 'Organization is required.');
        }$this->authz->authorize($actor, $orgId, 'timesheet.view');
        $query = Timesheet::query()->with(['employee', 'organization']);
        $this->dataScope->applyEmployeeRelatedScope($query, $actor, $orgId);
        if (! empty($filters['branch_id'])) {
            $query->whereHas('employee', fn ($q) => $q->where('branch_id', (int) $filters['branch_id']));
        }if (! empty($filters['employee_id'])) {
            $query->where('employee_id', (int) $filters['employee_id']);
        }if (! empty($filters['start_date'])) {
            $query->whereDate('date', '>=', $filters['start_date']);
        }if (! empty($filters['end_date'])) {
            $query->whereDate('date', '<=', $filters['end_date']);
        }if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('employee', fn ($q) => $q->where('first_name', 'like', "%{$search}%")->orWhere('last_name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
        }

        return $query->orderByDesc('date')->orderByDesc('clock_in')->paginate((int) ($filters['per_page'] ?? 15));
    }

    public function today(User $actor, ?int $employeeId = null): array
    {
        $employee = $this->resolveEmployeeForToday($actor, $employeeId);
        if (! $employee) {
            return ['employee_profile_linked' => false, 'is_clocked_in' => false, 'active_timesheet' => null, 'today' => today()->toDateString(), 'total_today_hours' => 0.0];
        }$timesheet = Timesheet::query()->with('employee')->where('employee_id', $employee->id)->whereDate('date', today())->first();

        return ['employee_profile_linked' => true, 'is_clocked_in' => (bool) ($timesheet?->clock_in && ! $timesheet?->clock_out), 'active_timesheet' => $timesheet, 'today' => today()->toDateString(), 'total_today_hours' => (float) ($timesheet?->total_hours ?? 0)];
    }

    public function accessible(User $actor, Timesheet $timesheet): Timesheet
    {
        $this->assertTimesheetAccess($actor, $timesheet);

        return $timesheet->load('employee');
    }

    public function clockIn(User $actor, ?int $employeeId = null): Timesheet
    {
        $employee = $this->resolveEmployee($actor, $employeeId, false);
        $clockIn = now();
        $date = $clockIn->toDateString();

        return DB::transaction(function () use ($employee, $clockIn, $date) {
            $timesheet = Timesheet::query()->where('employee_id', $employee->id)->whereDate('date', $date)->lockForUpdate()->first();
            if ($timesheet?->clock_in && ! $timesheet->clock_out) {
                abort(409, 'Employee is already clocked in.');
            }if ($timesheet?->clock_out) {
                abort(409, "Today's timesheet is already completed.");
            }$timesheet ??= new Timesheet(['organization_id' => $employee->organization_id, 'employee_id' => $employee->id, 'date' => $date, 'status' => 'present']);
            $timesheet->clock_in = $clockIn;
            $timesheet->clock_out = null;
            $timesheet->total_hours = 0;
            $timesheet->save();

            return $timesheet->load('employee');
        });
    }

    public function clockOut(User $actor, ?int $employeeId = null): Timesheet
    {
        $employee = $this->resolveEmployee($actor, $employeeId, false);
        $clockOut = now();

        return DB::transaction(function () use ($employee, $clockOut) {
            $timesheet = Timesheet::query()->where('employee_id', $employee->id)->whereNotNull('clock_in')->whereNull('clock_out')->orderByDesc('clock_in')->lockForUpdate()->first();
            if (! $timesheet) {
                abort(409, 'No active clock-in was found.');
            }if ($clockOut->lessThan($timesheet->clock_in)) {
                abort(422, 'Clock-out time cannot be before clock-in time.');
            }$timesheet->clock_out = $clockOut;
            $timesheet->total_hours = round($timesheet->clock_in->diffInMinutes($clockOut) / 60, 2);
            $timesheet->save();

            return $timesheet->load('employee');
        });
    }

    public function create(User $actor, array $data): Timesheet
    {
        $employee = $this->resolveEmployee($actor, (int) $data['employee_id'], true);
        $this->authz->authorize($actor, (int) $employee->organization_id, 'timesheet.manage');
        $payload = $this->normalizedPayload($data);
        $payload['organization_id'] = $employee->organization_id;

        return Timesheet::create($payload)->load('employee');
    }

    public function update(User $actor, Timesheet $timesheet, array $data): Timesheet
    {
        $this->assertTimesheetAccess($actor, $timesheet);
        $this->authz->authorize($actor, (int) $timesheet->organization_id, 'timesheet.manage');
        if (isset($data['employee_id'])) {
            $employee = $this->resolveEmployee($actor, (int) $data['employee_id'], true);
            abort_unless((int) $employee->organization_id === (int) $timesheet->organization_id, 422, 'Cross-organization reassignment is not allowed.');
        }$timesheet->update($this->normalizedPayload($data, $timesheet));

        return $timesheet->load('employee');
    }

    public function delete(User $actor, Timesheet $timesheet): void
    {
        $this->assertTimesheetAccess($actor, $timesheet);
        $this->authz->authorize($actor, (int) $timesheet->organization_id, 'timesheet.manage');
        $timesheet->delete();
    }

    private function resolveEmployeeForToday(User $actor, ?int $employeeId): ?Employee
    {
        if ($employeeId !== null) {
            return $this->resolveEmployee($actor, $employeeId, false);
        }

        return Employee::query()->where('user_id', $actor->id)->whereIn('organization_id', $actor->memberships()->where('status', 'active')->pluck('organization_id'))->first();
    }

    private function resolveEmployee(User $actor, ?int $employeeId, bool $managementAction): Employee
    {
        $query = Employee::query()->whereIn('organization_id', $actor->memberships()->where('status', 'active')->pluck('organization_id'));
        $employee = $employeeId ? $query->find($employeeId) : $query->where('user_id', $actor->id)->first();
        if (! $employee) {
            throw new AuthorizationException('No accessible employee profile was found for this action.');
        }$orgId = (int) $employee->organization_id;
        $isOwn = (int) $employee->user_id === (int) $actor->id;
        if ($isOwn && ! $managementAction) {
            $this->authz->authorize($actor, $orgId, 'timesheet.view');

            return $employee;
        }$this->authz->authorize($actor, $orgId, $managementAction ? 'timesheet.manage' : 'timesheet.view');
        $this->dataScope->assertEmployee($actor, $orgId, $employee);

        return $employee;
    }

    private function assertTimesheetAccess(User $actor, Timesheet $timesheet): void
    {
        $orgId = (int) $timesheet->organization_id;
        $this->authz->authorize($actor, $orgId, 'timesheet.view');
        $this->dataScope->assertEmployee($actor, $orgId, (int) $timesheet->employee_id);
    }

    private function normalizedPayload(array $data, ?Timesheet $existing = null): array
    {
        $clockInValue = array_key_exists('clock_in', $data) ? $data['clock_in'] : $existing?->clock_in;
        $clockOutValue = array_key_exists('clock_out', $data) ? $data['clock_out'] : $existing?->clock_out;
        $clockIn = $clockInValue ? Carbon::parse($clockInValue) : null;
        $clockOut = $clockOutValue ? Carbon::parse($clockOutValue) : null;
        if ($clockIn && $clockOut && $clockOut->lessThan($clockIn)) {
            abort(422, 'Clock-out time cannot be before clock-in time.');
        }if ($clockIn && $clockOut && ! array_key_exists('total_hours', $data)) {
            $data['total_hours'] = round($clockIn->diffInMinutes($clockOut) / 60, 2);
        } elseif (array_key_exists('clock_in', $data) || array_key_exists('clock_out', $data)) {
            if (! $clockIn || ! $clockOut) {
                $data['total_hours'] = 0;
            }
        }

        return $data;
    }
}
