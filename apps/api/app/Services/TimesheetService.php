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

    public function __construct(private readonly OrganizationAccessService $access) {}

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(User $actor, array $filters): LengthAwarePaginator
    {
        $organizationIds = $this->access->organizationIds($actor);
        $manageableOrganizationIds = $this->access->organizationIds($actor, OrganizationAccessService::TIMESHEET_MANAGER_ROLES);
        $ownEmployeeIds = $this->access->ownEmployeeIds($actor, $organizationIds);
        $query = Timesheet::query()->with(['employee', 'organization']);

        if (! empty($filters['organization_id'])) {
            $query->where('organization_id', (int) $filters['organization_id']);
        }
        if (! empty($filters['branch_id'])) {
            $query->whereHas('employee', fn ($q) => $q->where('branch_id', (int) $filters['branch_id']));
        }

        if ($manageableOrganizationIds === [] && $ownEmployeeIds === []) {
            $query->whereRaw('1 = 0');
        } else {
            $query->where(function ($scope) use ($manageableOrganizationIds, $ownEmployeeIds) {
                if ($manageableOrganizationIds !== []) {
                    $scope->whereIn('organization_id', $manageableOrganizationIds);
                }

                if ($ownEmployeeIds !== []) {
                    $manageableOrganizationIds === []
                        ? $scope->whereIn('employee_id', $ownEmployeeIds)
                        : $scope->orWhereIn('employee_id', $ownEmployeeIds);
                }
            });
        }

        if (! empty($filters['employee_id'])) {
            $query->where('employee_id', (int) $filters['employee_id']);
        }
        if (! empty($filters['start_date'])) {
            $query->whereDate('date', '>=', $filters['start_date']);
        }
        if (! empty($filters['end_date'])) {
            $query->whereDate('date', '<=', $filters['end_date']);
        }
        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('employee', fn ($q) => $q
                ->where('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        return $query
            ->orderByDesc('date')
            ->orderByDesc('clock_in')
            ->paginate((int) ($filters['per_page'] ?? 15));
    }

    /**
     * @return array{employee_profile_linked:bool,is_clocked_in:bool,active_timesheet:?Timesheet,today:string,total_today_hours:float}
     */
    public function today(User $actor, ?int $employeeId = null): array
    {
        $employee = $this->resolveEmployeeForToday($actor, $employeeId);

        if (! $employee) {
            return [
                'employee_profile_linked' => false,
                'is_clocked_in' => false,
                'active_timesheet' => null,
                'today' => today()->toDateString(),
                'total_today_hours' => 0.0,
            ];
        }

        $timesheet = Timesheet::query()
            ->with('employee')
            ->where('employee_id', $employee->id)
            ->whereDate('date', today())
            ->first();

        return [
            'employee_profile_linked' => true,
            'is_clocked_in' => (bool) ($timesheet?->clock_in && ! $timesheet?->clock_out),
            'active_timesheet' => $timesheet,
            'today' => today()->toDateString(),
            'total_today_hours' => (float) ($timesheet?->total_hours ?? 0),
        ];
    }

    public function accessible(User $actor, Timesheet $timesheet): Timesheet
    {
        $this->assertTimesheetAccess($actor, $timesheet);

        return $timesheet->load('employee');
    }

    public function clockIn(User $actor, ?int $employeeId = null): Timesheet
    {
        $employee = $this->resolveEmployee($actor, $employeeId);
        $clockIn = now();
        $date = $clockIn->toDateString();

        return DB::transaction(function () use ($employee, $clockIn, $date) {
            $timesheet = Timesheet::query()
                ->where('employee_id', $employee->id)
                ->whereDate('date', $date)
                ->lockForUpdate()
                ->first();

            if ($timesheet?->clock_in && ! $timesheet->clock_out) {
                abort(409, 'Employee is already clocked in.');
            }
            if ($timesheet?->clock_out) {
                abort(409, 'Today\'s timesheet is already completed.');
            }

            $timesheet ??= new Timesheet([
                'organization_id' => $employee->organization_id,
                'employee_id' => $employee->id,
                'date' => $date,
                'status' => 'present',
            ]);

            $timesheet->clock_in = $clockIn;
            $timesheet->clock_out = null;
            $timesheet->total_hours = 0;
            $timesheet->save();

            return $timesheet->load('employee');
        });
    }

    public function clockOut(User $actor, ?int $employeeId = null): Timesheet
    {
        $employee = $this->resolveEmployee($actor, $employeeId);
        $clockOut = now();

        return DB::transaction(function () use ($employee, $clockOut) {
            $timesheet = Timesheet::query()
                ->where('employee_id', $employee->id)
                ->whereNotNull('clock_in')
                ->whereNull('clock_out')
                ->orderByDesc('clock_in')
                ->lockForUpdate()
                ->first();

            if (! $timesheet) {
                abort(409, 'No active clock-in was found.');
            }
            if ($clockOut->lessThan($timesheet->clock_in)) {
                abort(422, 'Clock-out time cannot be before clock-in time.');
            }

            $timesheet->clock_out = $clockOut;
            $timesheet->total_hours = round($timesheet->clock_in->diffInMinutes($clockOut) / 60, 2);
            $timesheet->save();

            return $timesheet->load('employee');
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(User $actor, array $data): Timesheet
    {
        $employee = $this->resolveEmployee($actor, (int) $data['employee_id']);
        $this->assertCanManage($actor, (int) $employee->organization_id);

        $payload = $this->normalizedPayload($data);
        $payload['organization_id'] = $employee->organization_id;

        $timesheet = Timesheet::create($payload);

        return $timesheet->load('employee');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(User $actor, Timesheet $timesheet, array $data): Timesheet
    {
        $this->assertTimesheetAccess($actor, $timesheet);
        $this->assertCanManage($actor, (int) $timesheet->organization_id);

        if (isset($data['employee_id'])) {
            $employee = $this->resolveEmployee($actor, (int) $data['employee_id']);
            $this->assertCanManage($actor, (int) $employee->organization_id);
            $data['organization_id'] = $employee->organization_id;
        }

        $payload = $this->normalizedPayload($data, $timesheet);
        $timesheet->update($payload);

        return $timesheet->load('employee');
    }

    public function delete(User $actor, Timesheet $timesheet): void
    {
        $this->assertTimesheetAccess($actor, $timesheet);
        $this->assertCanManage($actor, (int) $timesheet->organization_id);
        $timesheet->delete();
    }

    private function resolveEmployeeForToday(User $actor, ?int $employeeId): ?Employee
    {
        if ($employeeId !== null) {
            return $this->resolveEmployee($actor, $employeeId);
        }

        $organizationIds = $this->access->organizationIds($actor);

        if ($organizationIds === []) {
            return null;
        }

        return Employee::query()
            ->whereIn('organization_id', $organizationIds)
            ->where('user_id', $actor->id)
            ->first();
    }

    private function resolveEmployee(User $actor, ?int $employeeId): Employee
    {
        $organizationIds = $this->access->organizationIds($actor);
        $query = Employee::query()->whereIn('organization_id', $organizationIds);
        $employee = $employeeId
            ? $query->find($employeeId)
            : $query->where('user_id', $actor->id)->first();

        if (! $employee) {
            throw new AuthorizationException('No accessible employee profile was found for this action.');
        }

        $isOwnProfile = (int) $employee->user_id === (int) $actor->id;
        $manageableOrganizationIds = $this->access->organizationIds($actor, OrganizationAccessService::TIMESHEET_MANAGER_ROLES);
        $canManage = in_array((int) $employee->organization_id, $manageableOrganizationIds, true);

        if (! $isOwnProfile && ! $canManage) {
            throw new AuthorizationException('You do not have permission to act for this employee.');
        }

        return $employee;
    }

    private function assertTimesheetAccess(User $actor, Timesheet $timesheet): void
    {
        $manageableOrganizationIds = $this->access->organizationIds($actor, OrganizationAccessService::TIMESHEET_MANAGER_ROLES);
        $canManage = in_array((int) $timesheet->organization_id, $manageableOrganizationIds, true);
        $isOwnTimesheet = Employee::query()
            ->whereKey($timesheet->employee_id)
            ->where('user_id', $actor->id)
            ->exists();

        if (! $canManage && ! $isOwnTimesheet) {
            throw new AuthorizationException('You do not have access to this timesheet.');
        }
    }

    private function assertCanManage(User $actor, int $organizationId): void
    {
        $this->access->assertCanManage(
            $actor,
            $organizationId,
            OrganizationAccessService::TIMESHEET_MANAGER_ROLES,
            'You do not have permission to manage timesheets in this organization.'
        );
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function normalizedPayload(array $data, ?Timesheet $existing = null): array
    {
        $clockInValue = array_key_exists('clock_in', $data) ? $data['clock_in'] : $existing?->clock_in;
        $clockOutValue = array_key_exists('clock_out', $data) ? $data['clock_out'] : $existing?->clock_out;

        $clockIn = $clockInValue ? Carbon::parse($clockInValue) : null;
        $clockOut = $clockOutValue ? Carbon::parse($clockOutValue) : null;

        if ($clockIn && $clockOut && $clockOut->lessThan($clockIn)) {
            abort(422, 'Clock-out time cannot be before clock-in time.');
        }

        if ($clockIn && $clockOut && ! array_key_exists('total_hours', $data)) {
            $data['total_hours'] = round($clockIn->diffInMinutes($clockOut) / 60, 2);
        } elseif (array_key_exists('clock_in', $data) || array_key_exists('clock_out', $data)) {
            if (! $clockIn || ! $clockOut) {
                $data['total_hours'] = 0;
            }
        }

        return $data;
    }
}
