<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EmployeeService
{
    public function __construct(private readonly AuthorizationService $authz, private readonly DataScopeService $dataScope) {}

    public function paginate(User $actor, array $filters): LengthAwarePaginator
    {
        $orgId = (int) ($filters['organization_id'] ?? 0);
        if (! $orgId) {
            abort(400, 'Organization is required.');
        }$this->authz->authorize($actor, $orgId, 'employee.read');
        $query = Employee::query()->with(['organization', 'branch', 'department', 'designation', 'manager']);
        $this->dataScope->applyEmployeeScope($query, $actor, $orgId);
        if (! empty($filters['branch_id'])) {
            $query->where('branch_id', (int) $filters['branch_id']);
        }if (! empty($filters['department']) && $filters['department'] !== 'all') {
            $v = $filters['department'];
            $query->whereHas('department', fn ($q) => $q->where('id', $v)->orWhere('name', $v)->orWhere('code', $v));
        }if (! empty($filters['location']) && $filters['location'] !== 'all') {
            $v = $filters['location'];
            $query->whereHas('branch', fn ($q) => $q->where('id', $v)->orWhere('name', $v)->orWhere('code', $v));
        }if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(fn ($q) => $q->where('first_name', 'like', "%{$search}%")->orWhere('last_name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")->orWhere('employee_id', 'like', "%{$search}%"));
        }

        return $query->orderBy('first_name')->orderBy('last_name')->paginate((int) ($filters['per_page'] ?? 15));
    }

    public function options(User $actor, ?int $organizationId = null, ?int $branchId = null): array
    {
        $orgId = (int) $organizationId;
        if (! $orgId) {
            return ['departments' => collect(), 'locations' => collect(), 'department_records' => collect(), 'branches' => collect(), 'designations' => collect(), 'managers' => collect()];
        }$this->authz->authorize($actor, $orgId, 'employee.read');
        $departmentQuery = Department::query();
        $this->dataScope->applyDepartmentScope($departmentQuery, $actor, $orgId);
        $departments = $departmentQuery->when($branchId, fn ($q) => $q->where('branch_id', $branchId))->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code', 'branch_id']);
        $branchQuery = Branch::query();
        $this->dataScope->applyBranchScope($branchQuery, $actor, $orgId);
        $branches = $branchQuery->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']);
        $designations = Designation::query()->where('organization_id', $orgId)->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']);
        $managerQuery = Employee::query();
        $this->dataScope->applyEmployeeScope($managerQuery, $actor, $orgId);
        $managers = $managerQuery->when($branchId, fn ($q) => $q->where('branch_id', $branchId))->where('status', 'active')->orderBy('first_name')->orderBy('last_name')->get(['id', 'employee_id', 'first_name', 'last_name']);

        return ['departments' => $departments->pluck('name')->unique()->values(), 'locations' => $branches->pluck('name')->unique()->values(), 'department_records' => $departments->map(fn ($i) => ['id' => (string) $i->id, 'name' => $i->name, 'code' => $i->code, 'branch_id' => $i->branch_id ? (string) $i->branch_id : null])->values(), 'branches' => $branches->map(fn ($i) => ['id' => (string) $i->id, 'name' => $i->name, 'code' => $i->code])->values(), 'designations' => $designations->map(fn ($i) => ['id' => (string) $i->id, 'name' => $i->name, 'code' => $i->code])->values(), 'managers' => $managers->map(fn ($i) => ['id' => (string) $i->id, 'employee_id' => $i->employee_id, 'name' => trim($i->first_name.' '.$i->last_name)])->values()];
    }

    public function summary(User $actor, ?int $organizationId = null, ?int $branchId = null): array
    {
        $orgId = (int) $organizationId;
        $this->authz->authorize($actor, $orgId, 'employee.read');
        $query = Employee::query();
        $this->dataScope->applyEmployeeScope($query, $actor, $orgId);
        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return ['total' => (clone $query)->count(), 'active' => (clone $query)->where('status', 'active')->count(), 'on_leave' => (clone $query)->where('status', 'on-leave')->count(), 'probation' => (clone $query)->where('status', 'probation')->count(), 'new_this_month' => (clone $query)->whereYear('hire_date', now()->year)->whereMonth('hire_date', now()->month)->count()];
    }
}
