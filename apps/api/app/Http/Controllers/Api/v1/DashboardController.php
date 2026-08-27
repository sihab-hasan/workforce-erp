<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Document;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\Timesheet;
use App\Models\WorkforceNotification;
use App\Services\OrganizationAccessService;
use App\Services\WorkforceScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private readonly WorkforceScopeService $scope, private readonly OrganizationAccessService $access) {}

    public function index(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        $employees = Employee::query()->where('organization_id', $org->id)->when($branch, fn ($q) => $q->where('branch_id', $branch->id));
        $departments = Department::query()->where('organization_id', $org->id)->when($branch, fn ($q) => $q->where('branch_id', $branch->id));
        $leave = LeaveRequest::query()->where('organization_id', $org->id)->when($branch, fn ($q) => $q->where('branch_id', $branch->id));
        $timesheets = Timesheet::query()->where('organization_id', $org->id)->when($branch, fn ($q) => $q->whereHas('employee', fn ($e) => $e->where('branch_id', $branch->id)));
        $documents = Document::query()->where('organization_id', $org->id)->when($branch, fn ($q) => $q->where('branch_id', $branch->id));
        $today = today();
        $recentLeaves = (clone $leave)->with(['employee', 'leaveType'])->orderByDesc('created_at')->limit(5)->get()->map(fn ($l) => ['id' => (string) $l->id, 'employee' => $l->employee?->name, 'type' => $l->leaveType?->name, 'status' => $l->status, 'start_date' => $l->start_date?->toDateString(), 'end_date' => $l->end_date?->toDateString()]);

        return $this->successResponse([
            'kpis' => [
                'employees' => (clone $employees)->count(),
                'active_employees' => (clone $employees)->where('status', 'active')->count(),
                'departments' => (clone $departments)->where('is_active', true)->count(),
                'pending_leave' => (clone $leave)->where('status', 'pending')->count(),
                'today_present' => (clone $timesheets)->whereDate('date', $today)->whereNotNull('clock_in')->count(),
                'documents' => (clone $documents)->count(),
            ],
            'attendance' => [
                'present' => (clone $timesheets)->whereDate('date', $today)->whereNotNull('clock_in')->count(),
                'completed' => (clone $timesheets)->whereDate('date', $today)->whereNotNull('clock_out')->count(),
                'hours' => (float) (clone $timesheets)->whereDate('date', $today)->sum('total_hours'),
            ],
            'recent_leave' => $recentLeaves,
            'unread_notifications' => WorkforceNotification::query()->where('user_id', $request->user()->id)->whereNull('read_at')->where(fn ($q) => $q->whereNull('organization_id')->orWhere('organization_id', $org->id))->count(),
            'role' => $this->scope->role($request),
        ]);
    }
}
