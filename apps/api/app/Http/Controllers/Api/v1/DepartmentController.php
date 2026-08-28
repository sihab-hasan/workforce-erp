<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use App\Services\DataScopeService;
use App\Services\WorkforceScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DepartmentController extends Controller
{
    public function __construct(private readonly WorkforceScopeService $scope, private readonly DataScopeService $dataScope) {}

    public function index(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        $this->scope->authorize($request, 'department.view');
        $query = Department::query()->with(['branch', 'manager'])->withCount('employees');
        $this->dataScope->applyDepartmentScope($query, $request->user(), (int) $org->id);
        if ($branch) {
            $query->where('branch_id', $branch->id);
        }
        if ($request->filled('search')) {
            $term = trim((string) $request->input('search'));
            $query->where(fn ($q) => $q->where('name', 'like', "%{$term}%")->orWhere('code', 'like', "%{$term}%"));
        }
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('is_active', $request->input('status') === 'active');
        }
        $paginator = $query->orderBy('name')->paginate(min(100, max(1, (int) $request->input('per_page', 20))));
        $paginator->setCollection($paginator->getCollection()->map(fn ($department) => $this->serialize($department)));

        return $this->successResponse($paginator);
    }

    public function store(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        $this->scope->authorize($request, 'department.manage');
        $data = $this->validatePayload($request, null, (int) $org->id);
        $data['organization_id'] = $org->id;
        $data['branch_id'] = $branch?->id ?? ($data['branch_id'] ?? null);
        if (! $this->dataScope->isOrganizationWide($request->user(), (int) $org->id)) {
            abort_unless($data['branch_id'] && $this->dataScope->allowsBranch($request->user(), (int) $org->id, (int) $data['branch_id']), 403, 'The selected company is outside your data scope.');
        }
        $this->validateManager($data['manager_id'] ?? null, (int) $org->id, $data['branch_id'] ?? null);
        $department = Department::create($data);

        return $this->successResponse($this->serialize($department->load(['branch', 'manager'])->loadCount('employees')), 'Department created successfully', 201);
    }

    public function show(Request $request, Department $department): JsonResponse
    {
        $this->assertScoped($request, $department);

        return $this->successResponse($this->serialize($department->load(['branch', 'manager'])->loadCount('employees')));
    }

    public function update(Request $request, Department $department): JsonResponse
    {
        $org = $this->assertScoped($request, $department);
        $this->scope->authorize($request, 'department.manage');
        $data = $this->validatePayload($request, $department, (int) $org->id);
        abort_unless($this->dataScope->allowsDepartment($request->user(), (int) $org->id, (int) $department->id), 403);
        $targetBranch = $data['branch_id'] ?? $department->branch_id;
        if ($targetBranch) {
            abort_unless($this->dataScope->allowsBranch($request->user(), (int) $org->id, (int) $targetBranch), 403, 'The selected company is outside your data scope.');
        }
        $this->validateManager($data['manager_id'] ?? $department->manager_id, (int) $org->id, $targetBranch);
        $department->update($data);

        return $this->successResponse($this->serialize($department->fresh()->load(['branch', 'manager'])->loadCount('employees')), 'Department updated successfully');
    }

    public function destroy(Request $request, Department $department): JsonResponse
    {
        $this->assertScoped($request, $department);
        $this->scope->authorize($request, 'department.manage');
        abort_unless($this->dataScope->allowsDepartment($request->user(), (int) $department->organization_id, (int) $department->id), 403);
        if ($department->employees()->exists()) {
            abort(409, 'Move the employees before deleting this department.');
        }
        $department->delete();

        return $this->successResponse(null, 'Department deleted successfully');
    }

    private function assertScoped(Request $request, Department $department)
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        abort_unless((int) $department->organization_id === (int) $org->id, 404);
        if ($branch) {
            abort_unless((int) $department->branch_id === (int) $branch->id, 404);
        }
        $this->scope->authorize($request, 'department.view');
        abort_unless($this->dataScope->allowsDepartment($request->user(), (int) $org->id, (int) $department->id), 403);

        return $org;
    }

    private function validatePayload(Request $request, ?Department $department, int $organizationId): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('departments', 'name')->where('organization_id', $organizationId)->ignore($department?->id)],
            'code' => ['nullable', 'string', 'max:64'],
            'branch_id' => ['nullable', 'integer', Rule::exists('branches', 'id')->where('organization_id', $organizationId)],
            'manager_id' => ['nullable', 'integer'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }

    private function validateManager(?int $managerId, int $organizationId, ?int $branchId): void
    {
        if (! $managerId) {
            return;
        }
        $query = Employee::query()->whereKey($managerId)->where('organization_id', $organizationId);
        if ($branchId) {
            $query->where('branch_id', $branchId);
        }
        abort_unless($query->exists(), 422, 'The selected manager is not available in this organization/company.');
    }

    private function serialize(Department $department): array
    {
        return [
            'id' => (string) $department->id,
            'name' => $department->name,
            'code' => $department->code,
            'organization_id' => (string) $department->organization_id,
            'branch' => $department->branch ? ['id' => (string) $department->branch->id, 'name' => $department->branch->name, 'code' => $department->branch->code] : null,
            'manager' => $department->manager ? ['id' => (string) $department->manager->id, 'name' => $department->manager->name, 'employee_id' => $department->manager->employee_id] : null,
            'employees_count' => (int) ($department->employees_count ?? $department->employees()->count()),
            'is_active' => (bool) $department->is_active,
            'created_at' => $department->created_at?->toIso8601String(),
            'updated_at' => $department->updated_at?->toIso8601String(),
        ];
    }
}
