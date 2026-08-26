<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employees\ListEmployeesRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use App\Services\EmployeeService;
use App\Services\WorkforceScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    public function __construct(
        private readonly EmployeeService $employeeService,
        private readonly WorkforceScopeService $scope,
    ) {}

    public function index(ListEmployeesRequest $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        $filters = $request->validated();
        $filters['organization_id'] = $org->id;
        if ($branch) $filters['branch_id'] = $branch->id;
        $paginator = $this->employeeService->paginate($request->user(), $filters);
        return $this->successResponse(EmployeeResource::collection($paginator), 'Employees retrieved successfully');
    }

    public function options(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        return $this->successResponse($this->employeeService->options($request->user(), (int) $org->id, $branch?->id));
    }

    public function summary(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        return $this->successResponse($this->employeeService->summary($request->user(), (int) $org->id, $branch?->id));
    }

    public function store(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        $this->scope->assertRole($request, ['owner', 'admin']);
        $data = $this->payload($request, null, (int) $org->id);
        $data['organization_id'] = $org->id;
        if ($branch) $data['branch_id'] = $branch->id;
        $employee = Employee::create($data)->load(['organization','branch','department','designation','manager']);
        return $this->successResponse(new EmployeeResource($employee), 'Employee created successfully', 201);
    }

    public function show(Request $request, Employee $employee): JsonResponse
    {
        $this->assertScoped($request, $employee);
        return $this->successResponse(new EmployeeResource($employee->load(['organization','branch','department','designation','manager'])));
    }

    public function update(Request $request, Employee $employee): JsonResponse
    {
        $org = $this->assertScoped($request, $employee);
        $this->scope->assertRole($request, ['owner', 'admin']);
        $employee->update($this->payload($request, $employee, (int) $org->id, true));
        return $this->successResponse(new EmployeeResource($employee->fresh()->load(['organization','branch','department','designation','manager'])), 'Employee updated successfully');
    }

    public function destroy(Request $request, Employee $employee): JsonResponse
    {
        $this->assertScoped($request, $employee);
        $this->scope->assertRole($request, ['owner']);
        if ($employee->timesheets()->exists() || $employee->leaveRequests()->exists()) {
            $employee->update(['status' => 'inactive', 'termination_date' => $employee->termination_date ?? today()]);
            return $this->successResponse(null, 'Employee has historical records and was deactivated instead of deleted.');
        }
        $employee->delete();
        return $this->successResponse(null, 'Employee deleted successfully');
    }

    private function assertScoped(Request $request, Employee $employee)
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        abort_unless((int) $employee->organization_id === (int) $org->id, 404);
        if ($branch) abort_unless((int) $employee->branch_id === (int) $branch->id, 404);
        return $org;
    }

    private function payload(Request $request, ?Employee $employee, int $organizationId, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';
        return $request->validate([
            'employee_id' => [$required, 'string', 'max:64', Rule::unique('employees', 'employee_id')->where('organization_id', $organizationId)->ignore($employee?->id)],
            'first_name' => [$required, 'string', 'max:120'],
            'last_name' => [$required, 'string', 'max:120'],
            'email' => [$required, 'email', 'max:255', Rule::unique('employees', 'email')->where('organization_id', $organizationId)->ignore($employee?->id)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'user_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'branch_id' => ['sometimes', 'nullable', 'integer', Rule::exists('branches', 'id')->where('organization_id', $organizationId)],
            'department_id' => ['sometimes', 'nullable', 'integer', Rule::exists('departments', 'id')->where('organization_id', $organizationId)],
            'designation_id' => ['sometimes', 'nullable', 'integer', Rule::exists('designations', 'id')->where('organization_id', $organizationId)],
            'manager_id' => ['sometimes', 'nullable', 'integer', Rule::exists('employees', 'id')->where('organization_id', $organizationId)],
            'hire_date' => [$required, 'date'],
            'termination_date' => ['sometimes', 'nullable', 'date'],
            'status' => ['sometimes', Rule::in(['active','inactive','on-leave','probation','terminated'])],
            'employment_type' => ['sometimes', Rule::in(['full-time','part-time','contract','intern','temporary'])],
            'date_of_birth' => ['sometimes', 'nullable', 'date', 'before:today'],
            'gender' => ['sometimes', 'nullable', 'string', 'max:32'],
            'address' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'emergency_contact_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:5000'],
        ]);
    }
}
