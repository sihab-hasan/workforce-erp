<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class EmployeeService
{
    public function __construct(private readonly OrganizationAccessService $access) {}

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(User $actor, array $filters): LengthAwarePaginator
    {
        $organizationIds = $this->access->organizationIds($actor);
        $query = Employee::query()->with(['organization', 'branch', 'department', 'designation', 'manager']);

        if (! empty($filters['organization_id'])) {
            $query->where('organization_id', (int) $filters['organization_id']);
        }
        if (! empty($filters['branch_id'])) {
            $query->where('branch_id', (int) $filters['branch_id']);
        }

        if ($organizationIds === []) {
            $query->whereRaw('1 = 0');
        } else {
            $query->whereIn('organization_id', $organizationIds);
        }

        if (! empty($filters['department']) && $filters['department'] !== 'all') {
            $department = $filters['department'];
            $query->whereHas('department', fn ($q) => $q
                ->where('id', $department)
                ->orWhere('name', $department)
                ->orWhere('code', $department));
        }

        if (! empty($filters['location']) && $filters['location'] !== 'all') {
            $location = $filters['location'];
            $query->whereHas('branch', fn ($q) => $q
                ->where('id', $location)
                ->orWhere('name', $location)
                ->orWhere('code', $location));
        }

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(fn ($q) => $q
                ->where('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('employee_id', 'like', "%{$search}%"));
        }

        return $query
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->paginate((int) ($filters['per_page'] ?? 15));
    }

    /**
     * @return array{departments:Collection<int,string>,locations:Collection<int,string>}
     */
    public function options(User $actor, ?int $organizationId = null, ?int $branchId = null): array
    {
        $organizationIds = $organizationId ? [$organizationId] : $this->access->organizationIds($actor);

        $departments = Department::query()->whereIn('organization_id', $organizationIds)->when($branchId, fn ($q) => $q->where('branch_id', $branchId))->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code', 'branch_id']);
        $branches = Branch::query()->whereIn('organization_id', $organizationIds)->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']);
        $designations = \App\Models\Designation::query()->whereIn('organization_id', $organizationIds)->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']);
        $managers = Employee::query()->whereIn('organization_id', $organizationIds)->when($branchId, fn ($q) => $q->where('branch_id', $branchId))->where('status', 'active')->orderBy('first_name')->orderBy('last_name')->get(['id', 'employee_id', 'first_name', 'last_name']);

        return [
            'departments' => $departments->pluck('name')->unique()->values(),
            'locations' => $branches->pluck('name')->unique()->values(),
            'department_records' => $departments->map(fn ($item) => ['id' => (string) $item->id, 'name' => $item->name, 'code' => $item->code, 'branch_id' => $item->branch_id ? (string) $item->branch_id : null])->values(),
            'branches' => $branches->map(fn ($item) => ['id' => (string) $item->id, 'name' => $item->name, 'code' => $item->code])->values(),
            'designations' => $designations->map(fn ($item) => ['id' => (string) $item->id, 'name' => $item->name, 'code' => $item->code])->values(),
            'managers' => $managers->map(fn ($item) => ['id' => (string) $item->id, 'employee_id' => $item->employee_id, 'name' => trim($item->first_name.' '.$item->last_name)])->values(),
        ];
    }

    /**
     * @return array{total:int,active:int,on_leave:int,probation:int,new_this_month:int}
     */
    public function summary(User $actor, ?int $organizationId = null, ?int $branchId = null): array
    {
        $query = Employee::query()->whereIn('organization_id', $organizationId ? [$organizationId] : $this->access->organizationIds($actor));
        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return [
            'total' => (clone $query)->count(),
            'active' => (clone $query)->where('status', 'active')->count(),
            'on_leave' => (clone $query)->where('status', 'on-leave')->count(),
            'probation' => (clone $query)->where('status', 'probation')->count(),
            'new_this_month' => (clone $query)
                ->whereYear('hire_date', now()->year)
                ->whereMonth('hire_date', now()->month)
                ->count(),
        ];
    }
}
