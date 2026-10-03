<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Document;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\Timesheet;
use App\Models\WorkforceNotification;
use App\Services\AuthorizationService;
use App\Services\OrganizationAccessService;
use App\Services\WorkforceScopeService;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    private const WEEKEND_DAYS = [5, 6];

    public function __construct(
        private readonly WorkforceScopeService $scope,
        private readonly OrganizationAccessService $access,
        private readonly AuthorizationService $authorization,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $user = $request->user();

        $isManager = $this->authorization->can($user, (int) $org->id, 'leave.approve')
            || $this->authorization->can($user, (int) $org->id, 'employee.manage');

        return $isManager
            ? $this->ownerDashboard($request, $org)
            : $this->employeeDashboard($request, $org);
    }

    private function ownerDashboard(Request $request, $org): JsonResponse
    {
        $branch = $this->scope->branch($request, false);
        $employees = Employee::query()->where('organization_id', $org->id)->when($branch, fn ($q) => $q->where('branch_id', $branch->id));
        $departments = Department::query()->where('organization_id', $org->id)->when($branch, fn ($q) => $q->where('branch_id', $branch->id));
        $leave = LeaveRequest::query()->where('organization_id', $org->id)->when($branch, fn ($q) => $q->where('branch_id', $branch->id));
        $timesheets = Timesheet::query()->where('organization_id', $org->id)->when($branch, fn ($q) => $q->whereHas('employee', fn ($e) => $e->where('branch_id', $branch->id)));
        $documents = Document::query()->where('organization_id', $org->id)->when($branch, fn ($q) => $q->where('branch_id', $branch->id));
        $today = today();

        $recentLeaves = (clone $leave)->with(['employee', 'leaveType'])->orderByDesc('created_at')->limit(5)->get()
            ->map(fn ($l) => [
                'id' => (string) $l->id,
                'employee' => $l->employee?->name,
                'type' => $l->leaveType?->name,
                'status' => $l->status,
                'start_date' => $l->start_date?->toDateString(),
                'end_date' => $l->end_date?->toDateString(),
            ]);

        $todayAttendance = (clone $timesheets)->with('employee')->whereDate('date', $today)->whereNotNull('clock_in')
            ->orderBy('clock_in')->limit(50)->get()
            ->map(fn ($t) => [
                'id' => (string) $t->id,
                'employee' => $t->employee?->name,
                'clock_in' => $t->clock_in ? (string) $t->clock_in : null,
                'clock_out' => $t->clock_out ? (string) $t->clock_out : null,
            ]);

        $onLeaveToday = (clone $leave)->where('status', 'approved')
            ->whereDate('start_date', '<=', $today)->whereDate('end_date', '>=', $today)->count();

        return $this->successResponse([
            'view' => 'owner',
            'kpis' => [
                'employees' => (clone $employees)->count(),
                'active_employees' => (clone $employees)->where('status', 'active')->count(),
                'departments' => (clone $departments)->where('is_active', true)->count(),
                'pending_leave' => (clone $leave)->where('status', 'pending')->count(),
                'today_present' => (clone $timesheets)->whereDate('date', $today)->whereNotNull('clock_in')->count(),
                'on_leave_today' => $onLeaveToday,
                'documents' => (clone $documents)->count(),
            ],
            'attendance' => [
                'present' => (clone $timesheets)->whereDate('date', $today)->whereNotNull('clock_in')->count(),
                'completed' => (clone $timesheets)->whereDate('date', $today)->whereNotNull('clock_out')->count(),
                'hours' => (float) (clone $timesheets)->whereDate('date', $today)->sum('total_hours'),
            ],
            'today_attendance' => $todayAttendance,
            'recent_leave' => $recentLeaves,
            'unread_notifications' => $this->unread($request, $org),
            'role' => $this->scope->role($request),
        ]);
    }

    private function employeeDashboard(Request $request, $org): JsonResponse
    {
        $user = $request->user();
        $employee = Employee::query()->where('organization_id', $org->id)->where('user_id', $user->id)->first();
        $employeeId = $employee?->id ?? 0;
        $today = today();

        $todaySheet = Timesheet::query()->where('employee_id', $employeeId)->whereDate('date', $today)->first();

        $myLeave = LeaveRequest::query()->where('organization_id', $org->id)->where('employee_id', $employeeId);
        $recentLeaves = (clone $myLeave)->with('leaveType')->orderByDesc('created_at')->limit(5)->get()
            ->map(fn ($l) => [
                'id' => (string) $l->id,
                'employee' => $employee?->name,
                'type' => $l->leaveType?->name,
                'status' => $l->status,
                'start_date' => $l->start_date?->toDateString(),
                'end_date' => $l->end_date?->toDateString(),
            ]);

        return $this->successResponse([
            'view' => 'employee',
            'me' => [
                'employee_id' => $employee ? (string) $employee->id : null,
                'name' => $employee?->name ?? $user->name,
            ],
            'today' => [
                'clock_in' => $todaySheet?->clock_in ? (string) $todaySheet->clock_in : null,
                'clock_out' => $todaySheet?->clock_out ? (string) $todaySheet->clock_out : null,
                'hours' => (float) ($todaySheet?->total_hours ?? 0),
            ],
            'my_leave' => [
                'pending' => (clone $myLeave)->where('status', 'pending')->count(),
                'approved' => (clone $myLeave)->where('status', 'approved')->count(),
                'recent' => $recentLeaves,
            ],
            'attendance_month' => $this->monthlyAttendance($employee),
            'my_documents' => Document::query()->where('organization_id', $org->id)->where('uploaded_by', $user->id)->count(),
            'unread_notifications' => $this->unread($request, $org),
            'role' => $this->scope->role($request),
        ]);
    }

    private function monthlyAttendance(?Employee $employee): array
    {
        $today = today();
        $start = $today->copy()->startOfMonth();
        if ($employee?->hire_date && $employee->hire_date->gt($start)) {
            $start = $employee->hire_date->copy()->startOfDay();
        }

        if (! $employee || $start->gt($today)) {
            return ['working_days' => 0, 'present' => 0, 'absent' => 0, 'leave' => 0, 'month' => $today->format('F Y')];
        }

        $presentDates = Timesheet::query()
            ->where('employee_id', $employee->id)
            ->whereBetween('date', [$start->toDateString(), $today->toDateString()])
            ->whereNotNull('clock_in')
            ->pluck('date')
            ->map(fn ($d) => \Illuminate\Support\Carbon::parse($d)->toDateString())
            ->unique()
            ->flip();

        $leaveDates = [];
        LeaveRequest::query()
            ->where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $start)
            ->get(['start_date', 'end_date'])
            ->each(function ($l) use (&$leaveDates, $start, $today) {
                $from = $l->start_date->max($start);
                $to = $l->end_date->min($today);
                foreach (CarbonPeriod::create($from, $to) as $day) {
                    $leaveDates[$day->toDateString()] = true;
                }
            });

        $working = $present = $absent = $leave = 0;
        foreach (CarbonPeriod::create($start, $today) as $day) {
            if (in_array($day->dayOfWeek, self::WEEKEND_DAYS, true)) {
                continue;
            }
            $working++;
            $key = $day->toDateString();
            if (isset($presentDates[$key])) {
                $present++;
            } elseif (isset($leaveDates[$key])) {
                $leave++;
            } elseif (! $day->isSameDay($today)) {
                $absent++;
            }
        }

        return [
            'month' => $today->format('F Y'),
            'working_days' => $working,
            'present' => $present,
            'absent' => $absent,
            'leave' => $leave,
        ];
    }

    private function unread(Request $request, $org): int
    {
        return WorkforceNotification::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->where(fn ($q) => $q->whereNull('organization_id')->orWhere('organization_id', $org->id))
            ->count();
    }
}