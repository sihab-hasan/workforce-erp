<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class DataScopeService
{
    public function __construct(private readonly AuthorizationService $authorization) {}

    /** @return array<int>|null Null means unrestricted inside the organization. */
    public function accessibleEmployeeIds(User $user, int $organizationId): ?array
    {
        $roles = array_map('strtolower', $this->authorization->roles($user, $organizationId));
        if (array_intersect($roles, ['owner', 'admin', 'organization_owner', 'organization_admin']) !== []) {
            return null;
        }

        $scopes = $this->authorization->scopes($user, $organizationId);
        if ($scopes === []) {
            return [];
        }
        if (collect($scopes)->contains(fn ($s) => in_array($s['scope'] ?? '', ['GLOBAL', 'ORGANIZATION'], true))) {
            return null;
        }

        $self = Employee::query()->where('organization_id', $organizationId)->where('user_id', $user->id)->first();
        $ids = [];
        foreach ($scopes as $entry) {
            $scope = strtoupper((string) ($entry['scope'] ?? 'OWN'));
            $data = is_array($entry['data'] ?? null) ? $entry['data'] : [];
            $explicit = collect($data['employee_ids'] ?? [])->map(fn ($v) => (int) $v)->filter()->all();
            $ids = array_merge($ids, $explicit);

            if ($scope === 'OWN' && $self) {
                $ids[] = (int) $self->id;
            }
            if ($scope === 'DIRECT_REPORTS' && $self) {
                $ids = array_merge($ids, Employee::query()->where('organization_id', $organizationId)->where('manager_id', $self->id)->pluck('id')->map(fn ($v) => (int) $v)->all());
            }
            if ($scope === 'TEAM' && $self) {
                $ids = array_merge($ids, $this->teamIds($organizationId, (int) $self->id));
            }

            $departmentIds = collect($data['department_ids'] ?? [])->map(fn ($v) => (int) $v)->filter()->all();
            if ($scope === 'DEPARTMENT' && $departmentIds === [] && $self?->department_id) {
                $departmentIds[] = (int) $self->department_id;
            }
            if ($departmentIds !== []) {
                $ids = array_merge($ids, Employee::query()->where('organization_id', $organizationId)->whereIn('department_id', $departmentIds)->pluck('id')->map(fn ($v) => (int) $v)->all());
            }

            $branchIds = collect(array_merge($data['branch_ids'] ?? [], $data['company_ids'] ?? [], $data['business_unit_ids'] ?? []))->map(fn ($v) => (int) $v)->filter()->all();
            if (in_array($scope, ['BRANCH', 'COMPANY', 'BUSINESS_UNIT'], true) && $branchIds === [] && $self?->branch_id) {
                $branchIds[] = (int) $self->branch_id;
            }
            if ($branchIds !== []) {
                $ids = array_merge($ids, Employee::query()->where('organization_id', $organizationId)->whereIn('branch_id', $branchIds)->pluck('id')->map(fn ($v) => (int) $v)->all());
            }
        }

        return array_values(array_unique(array_map('intval', $ids)));
    }

    public function applyEmployeeScope(Builder $query, User $user, int $organizationId): Builder
    {
        $ids = $this->accessibleEmployeeIds($user, $organizationId);
        $query->where($query->qualifyColumn('organization_id'), $organizationId);
        if ($ids !== null) {
            $query->whereIn($query->qualifyColumn('id'), $ids ?: [-1]);
        }

        return $query;
    }

    public function applyEmployeeRelatedScope(Builder $query, User $user, int $organizationId, string $employeeColumn = 'employee_id'): Builder
    {
        $ids = $this->accessibleEmployeeIds($user, $organizationId);
        $query->where($query->qualifyColumn('organization_id'), $organizationId);
        if ($ids !== null) {
            $query->whereIn($query->qualifyColumn($employeeColumn), $ids ?: [-1]);
        }

        return $query;
    }

    public function applyDepartmentScope(Builder $query, User $user, int $organizationId): Builder
    {
        $ids = $this->accessibleEmployeeIds($user, $organizationId);
        $query->where($query->qualifyColumn('organization_id'), $organizationId);
        if ($ids === null) {
            return $query;
        }
        $departments = Employee::query()->whereIn('id', $ids ?: [-1])->whereNotNull('department_id')->pluck('department_id')->unique()->all();

        return $query->whereIn($query->qualifyColumn('id'), $departments ?: [-1]);
    }

    public function applyBranchScope(Builder $query, User $user, int $organizationId): Builder
    {
        $ids = $this->accessibleEmployeeIds($user, $organizationId);
        $query->where($query->qualifyColumn('organization_id'), $organizationId);
        if ($ids === null) {
            return $query;
        }
        $branches = Employee::query()->whereIn('id', $ids ?: [-1])->whereNotNull('branch_id')->pluck('branch_id')->unique()->all();

        return $query->whereIn($query->qualifyColumn('id'), $branches ?: [-1]);
    }

    public function allowsEmployee(User $user, int $organizationId, Employee|int $employee): bool
    {
        $id = $employee instanceof Employee ? (int) $employee->id : (int) $employee;
        $ids = $this->accessibleEmployeeIds($user, $organizationId);

        return $ids === null || in_array($id, $ids, true);
    }

    public function assertEmployee(User $user, int $organizationId, Employee|int $employee, string $message = 'The resource is outside your assigned data scope.'): void
    {
        if (! $this->allowsEmployee($user, $organizationId, $employee)) {
            throw new AuthorizationException($message);
        }
    }

    /** @return array<int>|null */
    public function accessibleBranchIds(User $user, int $organizationId): ?array
    {
        $ids = $this->accessibleEmployeeIds($user, $organizationId);
        if ($ids === null) {
            return null;
        }

        return Employee::query()->whereIn('id', $ids ?: [-1])->whereNotNull('branch_id')->pluck('branch_id')->map(fn ($v) => (int) $v)->unique()->values()->all();
    }

    /** @return array<int>|null */
    public function accessibleDepartmentIds(User $user, int $organizationId): ?array
    {
        $ids = $this->accessibleEmployeeIds($user, $organizationId);
        if ($ids === null) {
            return null;
        }

        return Employee::query()->whereIn('id', $ids ?: [-1])->whereNotNull('department_id')->pluck('department_id')->map(fn ($v) => (int) $v)->unique()->values()->all();
    }

    public function allowsBranch(User $user, int $organizationId, int $branchId): bool
    {
        $ids = $this->accessibleEmployeeIds($user, $organizationId);
        if ($ids === null) {
            return true;
        }

        return Employee::query()->whereIn('id', $ids ?: [-1])->where('branch_id', $branchId)->exists();
    }

    public function allowsDepartment(User $user, int $organizationId, int $departmentId): bool
    {
        $ids = $this->accessibleEmployeeIds($user, $organizationId);
        if ($ids === null) {
            return true;
        }

        return Employee::query()->whereIn('id', $ids ?: [-1])->where('department_id', $departmentId)->exists();
    }

    public function isOrganizationWide(User $user, int $organizationId): bool
    {
        return $this->accessibleEmployeeIds($user, $organizationId) === null;
    }

    public function assertPlacement(User $user, int $organizationId, ?int $branchId, ?int $departmentId): void
    {
        $ids = $this->accessibleEmployeeIds($user, $organizationId);
        if ($ids === null) {
            return;
        }
        if ($ids === []) {
            throw new AuthorizationException('Your data scope does not allow employee placement.');
        }
        $allowedBranches = Employee::query()->whereIn('id', $ids)->whereNotNull('branch_id')->pluck('branch_id')->map(fn ($v) => (int) $v)->unique()->all();
        $allowedDepartments = Employee::query()->whereIn('id', $ids)->whereNotNull('department_id')->pluck('department_id')->map(fn ($v) => (int) $v)->unique()->all();
        if ($branchId && ! in_array($branchId, $allowedBranches, true)) {
            throw new AuthorizationException('The selected branch is outside your assigned data scope.');
        }
        if ($departmentId && ! in_array($departmentId, $allowedDepartments, true)) {
            throw new AuthorizationException('The selected department is outside your assigned data scope.');
        }
    }

    /** @return array<int> Includes the manager and all descendants, cycle-safe. */
    private function teamIds(int $organizationId, int $rootEmployeeId): array
    {
        $result = [$rootEmployeeId];
        $frontier = [$rootEmployeeId];
        $seen = [$rootEmployeeId => true];
        for ($depth = 0; $depth < 20 && $frontier !== []; $depth++) {
            $children = DB::table('employees')->where('organization_id', $organizationId)->whereNull('deleted_at')->whereIn('manager_id', $frontier)->pluck('id')->map(fn ($v) => (int) $v)->all();
            $frontier = [];
            foreach ($children as $id) {
                if (! isset($seen[$id])) {
                    $seen[$id] = true;
                    $result[] = $id;
                    $frontier[] = $id;
                }
            }
        }

        return $result;
    }
}
