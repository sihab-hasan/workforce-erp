<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\Timesheet;
use App\Services\WorkforceScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private readonly WorkforceScopeService $scope) {}

    private function context(Request $request): array
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        $this->scope->assertRole($request, ['owner', 'admin', 'manager']);

        return [$org, $branch];
    }

    public function overview(Request $request): JsonResponse
    {
        [$org,$branch] = $this->context($request);
        $employees = Employee::query()->where('organization_id', $org->id)->when($branch, fn ($q) => $q->where('branch_id', $branch->id));
        $departments = Department::query()->where('organization_id', $org->id)->when($branch, fn ($q) => $q->where('branch_id', $branch->id));
        $leaves = LeaveRequest::query()->where('organization_id', $org->id)->when($branch, fn ($q) => $q->where('branch_id', $branch->id));
        $timesheets = Timesheet::query()->where('organization_id', $org->id)->when($branch, fn ($q) => $q->whereHas('employee', fn ($e) => $e->where('branch_id', $branch->id)));

        return $this->successResponse([
            'employees' => ['total' => (clone $employees)->count(), 'active' => (clone $employees)->where('status', 'active')->count()],
            'departments' => ['total' => (clone $departments)->count(), 'active' => (clone $departments)->where('is_active', true)->count()],
            'leave' => ['pending' => (clone $leaves)->where('status', 'pending')->count(), 'approved_this_month' => (clone $leaves)->where('status', 'approved')->whereYear('start_date', now()->year)->whereMonth('start_date', now()->month)->count()],
            'timesheets' => ['this_month_hours' => (float) (clone $timesheets)->whereYear('date', now()->year)->whereMonth('date', now()->month)->sum('total_hours'), 'pending' => (clone $timesheets)->where('status', 'pending')->count()],
        ]);
    }

    public function employees(Request $request): JsonResponse
    {
        [$org,$branch] = $this->context($request);
        $query = Employee::query()->where('organization_id', $org->id)->when($branch, fn ($q) => $q->where('branch_id', $branch->id));
        $byStatus = (clone $query)->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');
        $byType = (clone $query)->selectRaw('employment_type, COUNT(*) as total')->groupBy('employment_type')->pluck('total', 'employment_type');
        $byDepartment = (clone $query)->leftJoin('departments', 'employees.department_id', '=', 'departments.id')->selectRaw("COALESCE(departments.name, 'Unassigned') as label, COUNT(employees.id) as total")->groupBy('label')->orderByDesc('total')->get();

        return $this->successResponse(['total' => (clone $query)->count(), 'by_status' => $byStatus, 'by_employment_type' => $byType, 'by_department' => $byDepartment]);
    }

    public function departments(Request $request): JsonResponse
    {
        [$org,$branch] = $this->context($request);
        $rows = Department::query()->where('organization_id', $org->id)->when($branch, fn ($q) => $q->where('branch_id', $branch->id))->with(['manager', 'branch'])->withCount('employees')->orderBy('name')->get()->map(fn ($d) => [
            'id' => (string) $d->id, 'name' => $d->name, 'code' => $d->code, 'company' => $d->branch?->name, 'manager' => $d->manager?->name, 'employees_count' => $d->employees_count, 'is_active' => (bool) $d->is_active,
        ]);

        return $this->successResponse($rows);
    }

    public function leave(Request $request): JsonResponse
    {
        [$org,$branch] = $this->context($request);
        $query = LeaveRequest::query()->where('organization_id', $org->id)->when($branch, fn ($q) => $q->where('branch_id', $branch->id));
        if ($request->filled('start_date')) {
            $query->whereDate('end_date', '>=', $request->input('start_date'));
        }
        if ($request->filled('end_date')) {
            $query->whereDate('start_date', '<=', $request->input('end_date'));
        }
        $byStatus = (clone $query)->selectRaw('status, COUNT(*) as total, SUM(total_days) as days')->groupBy('status')->get();
        $byType = (clone $query)->join('leave_types', 'leave_requests.leave_type_id', '=', 'leave_types.id')->selectRaw('leave_types.name as label, COUNT(*) as total, SUM(total_days) as days')->groupBy('leave_types.name')->get();

        return $this->successResponse(['requests' => (clone $query)->count(), 'days' => (float) (clone $query)->where('status', 'approved')->sum('total_days'), 'by_status' => $byStatus, 'by_type' => $byType]);
    }

    public function timesheets(Request $request): JsonResponse
    {
        [$org,$branch] = $this->context($request);
        $query = Timesheet::query()->where('organization_id', $org->id)->when($branch, fn ($q) => $q->whereHas('employee', fn ($e) => $e->where('branch_id', $branch->id)));
        if ($request->filled('start_date')) {
            $query->whereDate('date', '>=', $request->input('start_date'));
        }
        if ($request->filled('end_date')) {
            $query->whereDate('date', '<=', $request->input('end_date'));
        }
        $byStatus = (clone $query)->selectRaw('status, COUNT(*) as total, SUM(total_hours) as hours')->groupBy('status')->get();
        $daily = (clone $query)->selectRaw('date, SUM(total_hours) as hours, COUNT(*) as records')->groupBy('date')->orderBy('date')->limit(60)->get();

        return $this->successResponse(['records' => (clone $query)->count(), 'hours' => (float) (clone $query)->sum('total_hours'), 'by_status' => $byStatus, 'daily' => $daily]);
    }
}
