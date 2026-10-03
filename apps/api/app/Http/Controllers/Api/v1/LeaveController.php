<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Notifications\LeaveRequestReviewed;
use App\Notifications\LeaveRequestSubmitted;
use App\Services\AuthorizationService;
use App\Services\DataScopeService;
use App\Services\NotificationAudience;
use App\Services\WorkforceScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class LeaveController extends Controller
{
    public function __construct(
        private readonly WorkforceScopeService $scope,
        private readonly DataScopeService $dataScope,
        private readonly AuthorizationService $authorization,
        private readonly NotificationAudience $audience,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        $query = LeaveRequest::query()->where('organization_id', $org->id)
            ->with(['employee.department', 'leaveType', 'reviewer']);
        if ($branch) {
            $query->where('branch_id', $branch->id);
        }

        $this->authorization->authorize($request->user(), (int) $org->id, 'leave.view');
        if ($request->boolean('mine')) {
            $ownId = Employee::query()->where('organization_id', $org->id)->where('user_id', $request->user()->id)->value('id');
            $query->where('employee_id', $ownId ?: 0);
        } else {
            $this->dataScope->applyEmployeeRelatedScope($query, $request->user(), (int) $org->id);
        }
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('start_date')) {
            $query->whereDate('end_date', '>=', $request->input('start_date'));
        }
        if ($request->filled('end_date')) {
            $query->whereDate('start_date', '<=', $request->input('end_date'));
        }
        if ($request->filled('search')) {
            $term = trim((string) $request->input('search'));
            $query->whereHas('employee', fn ($q) => $q->where('first_name', 'like', "%{$term}%")->orWhere('last_name', 'like', "%{$term}%")->orWhere('employee_id', 'like', "%{$term}%"));
        }
        $paginator = $query->orderByDesc('created_at')->paginate(min(100, max(1, (int) $request->input('per_page', 20))));
        $paginator->setCollection($paginator->getCollection()->map(fn ($leave) => $this->serialize($leave)));

        return $this->successResponse($paginator);
    }

    public function options(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $this->authorization->authorize($request->user(), (int) $org->id, 'leave.view');
        $types = LeaveType::query()->where('organization_id', $org->id)->where('is_active', true)->orderBy('name')->get();
        $ownEmployeeId = (int) (Employee::query()->where('organization_id', $org->id)->where('user_id', $request->user()->id)->value('id') ?: 0);
        $year = (int) now()->year;
        $totals = $ownEmployeeId ? $this->yearTotalsByType($ownEmployeeId, $year) : collect();

        return $this->successResponse([
            'year' => $year,
            'has_employee_profile' => $ownEmployeeId > 0,
            'types' => $types->map(function (LeaveType $type) use ($totals) {
                $used = (float) ($totals[$type->id]['approved'] ?? 0);
                $pending = (float) ($totals[$type->id]['pending'] ?? 0);

                return [
                    'id' => (string) $type->id,
                    'name' => $type->name,
                    'code' => $type->code,
                    'annual_allowance' => (float) $type->annual_allowance,
                    'is_paid' => (bool) $type->is_paid,
                    'used' => $used,
                    'pending' => $pending,
                    'remaining' => max(0.0, (float) $type->annual_allowance - $used - $pending),
                ];
            })->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        $data = $request->validate([
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('organization_id', $org->id)],
            // Only active leave types of the current organization can be requested.
            'leave_type_id' => ['required', 'integer', Rule::exists('leave_types', 'id')->where('organization_id', $org->id)->where('is_active', true)],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['nullable', 'string', 'max:5000'],
        ]);
        $this->authorization->authorize($request->user(), (int) $org->id, 'leave.view');
        $ownEmployeeId = (int) (Employee::query()->where('organization_id', $org->id)->where('user_id', $request->user()->id)->value('id') ?: 0);
        $employeeId = isset($data['employee_id']) ? (int) $data['employee_id'] : $ownEmployeeId;
        if (! $employeeId) {
            abort(403, 'No employee profile is available for this leave request.');
        }
        $canManage = $this->authorization->can($request->user(), (int) $org->id, 'leave.manage');
        if ($employeeId !== $ownEmployeeId) {
            if (! $canManage) {
                abort(403, 'You cannot submit leave for this employee.');
            } $this->dataScope->assertEmployee($request->user(), (int) $org->id, $employeeId);
        }
        $employee = Employee::query()->whereKey($employeeId)->where('organization_id', $org->id)->firstOrFail();
        if ($branch && (int) $employee->branch_id !== (int) $branch->id) {
            abort(422, 'Employee does not belong to the selected company.');
        }

        $start = Carbon::parse($data['start_date'])->startOfDay();
        $end = Carbon::parse($data['end_date'])->startOfDay();
        // diffInWeekdays() excludes the end date, so extend the range by one
        // day to count both the first and the last day of the leave.
        $days = $start->diffInWeekdays($end->copy()->addDay());
        if ($days < 1) {
            return response()->json([
                'message' => 'The selected date range does not contain any working days.',
            ], 422);
        }
        $overlap = LeaveRequest::query()->where('employee_id', $employee->id)->whereIn('status', ['pending', 'approved'])
            ->where(fn ($q) => $q->whereBetween('start_date', [$start->toDateString(), $end->toDateString()])->orWhereBetween('end_date', [$start->toDateString(), $end->toDateString()])->orWhere(fn ($q2) => $q2->whereDate('start_date', '<=', $start)->whereDate('end_date', '>=', $end)))->exists();
        if ($overlap) {
            abort(409, 'This employee already has an overlapping leave request.');
        }

        $leaveType = LeaveType::query()->whereKey((int) $data['leave_type_id'])->firstOrFail();
        // Balance is tracked per leave type and per leave year (the year the
        // leave starts in). Pending requests reserve days so an employee cannot
        // queue several requests that together exceed the allowance.
        $totals = $this->yearTotalsByType($employee->id, (int) $start->year)[$leaveType->id] ?? ['approved' => 0.0, 'pending' => 0.0];
        $remaining = max(0.0, (float) $leaveType->annual_allowance - $totals['approved'] - $totals['pending']);

        if ((float) $days > $remaining) {
            return response()->json([
                'message' => sprintf(
                    'Insufficient leave balance. Requested: %s days, Remaining: %s days.',
                    $this->formatDays((float) $days),
                    $this->formatDays($remaining),
                ),
            ], 422);
        }

        $leave = LeaveRequest::create([
            ...$data,
            'employee_id' => $employee->id,
            'organization_id' => $org->id,
            'branch_id' => $employee->branch_id,
            'total_days' => $days,
            'status' => 'pending',
        ])->load(['employee.department', 'leaveType', 'reviewer']);
        $this->notifyManagers($org->id, $request->user()->id, $employee->name);

        return $this->successResponse($this->serialize($leave), 'Leave request submitted successfully', 201);
    }

    public function show(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $this->assertAccess($request, $leaveRequest);

        return $this->successResponse($this->serialize($leaveRequest->load(['employee.department', 'leaveType', 'reviewer'])));
    }

    public function cancel(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $this->assertAccess($request, $leaveRequest, true);
        if ($leaveRequest->status !== 'pending') {
            abort(409, 'This leave request cannot be cancelled.');
        }
        $leaveRequest->update(['status' => 'cancelled']);

        return $this->successResponse($this->serialize($leaveRequest->fresh()->load(['employee.department', 'leaveType', 'reviewer'])), 'Leave request cancelled');
    }

    public function approve(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        return $this->review($request, $leaveRequest, 'approved');
    }

    public function reject(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        return $this->review($request, $leaveRequest, 'rejected');
    }

    private function review(Request $request, LeaveRequest $leaveRequest, string $status): JsonResponse
    {
        $this->assertScoped($request, $leaveRequest);
        $this->scope->authorize($request, 'leave.approve');
        $this->dataScope->assertEmployee($request->user(), (int) $leaveRequest->organization_id, (int) $leaveRequest->employee_id);
        if ((int) ($leaveRequest->employee?->user_id ?? 0) === (int) $request->user()->id) {
            abort(409, 'Maker and checker must be different users.');
        }
        if ($leaveRequest->status !== 'pending') {
            abort(409, 'Only pending leave requests can be reviewed.');
        }
        $data = $request->validate(['review_note' => ['nullable', 'string', 'max:2000']]);
        if ($status === 'approved') {
            $this->assertApprovable($leaveRequest);
        }
        $leaveRequest->update([
            'status' => $status,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'review_note' => $data['review_note'] ?? null,
        ]);
        $leaveRequest->employee?->user?->notify(new LeaveRequestReviewed($leaveRequest, $status));

        return $this->successResponse($this->serialize($leaveRequest->fresh()->load(['employee.department', 'leaveType', 'reviewer'])), 'Leave request '.$status);
    }

    private function assertScoped(Request $request, LeaveRequest $leave): void
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        abort_unless((int) $leave->organization_id === (int) $org->id, 404);
        if ($branch) {
            abort_unless((int) $leave->branch_id === (int) $branch->id, 404);
        }
    }

    private function assertAccess(Request $request, LeaveRequest $leave, bool $ownRequired = false): void
    {
        $this->assertScoped($request, $leave);
        $this->authorization->authorize($request->user(), (int) $leave->organization_id, 'leave.view');
        $ownId = (int) (Employee::query()->where('organization_id', $leave->organization_id)->where('user_id', $request->user()->id)->value('id') ?: 0);
        if ((int) $leave->employee_id === $ownId) {
            return;
        }
        if ($ownRequired) {
            abort(403);
        }
        $this->authorization->authorize($request->user(), (int) $leave->organization_id, 'leave.manage');
        $this->dataScope->assertEmployee($request->user(), (int) $leave->organization_id, (int) $leave->employee_id);
    }

    private function notifyManagers(int $organizationId, int $excludeUserId, string $employeeName): void
    {
        foreach ($this->audience->usersWithPermission($organizationId, 'leave.approve', $excludeUserId) as $reviewer) {
            $reviewer->notify(new LeaveRequestSubmitted($organizationId, $employeeName));
        }
    }

    /**
     * Approved and pending day totals per leave type for one employee and year.
     *
     * @return \Illuminate\Support\Collection<int, array{approved: float, pending: float}>
     */
    private function yearTotalsByType(int $employeeId, int $year, ?int $excludeLeaveId = null)
    {
        return LeaveRequest::query()
            ->where('employee_id', $employeeId)
            ->whereIn('status', ['approved', 'pending'])
            ->whereYear('start_date', $year)
            ->when($excludeLeaveId, fn ($q) => $q->whereKeyNot($excludeLeaveId))
            ->selectRaw('leave_type_id, status, SUM(total_days) as days')
            ->groupBy('leave_type_id', 'status')
            ->get()
            ->groupBy('leave_type_id')
            ->map(fn ($rows) => [
                'approved' => (float) ($rows->firstWhere('status', 'approved')?->days ?? 0),
                'pending' => (float) ($rows->firstWhere('status', 'pending')?->days ?? 0),
            ]);
    }

    /**
     * Re-validates the balance at approval time. Other requests may have been
     * approved since this one was submitted, so the submission-time check is
     * not sufficient on its own. Only approved leave counts here: pending
     * requests are decided first-come, first-served.
     */
    private function assertApprovable(LeaveRequest $leave): void
    {
        $type = $leave->leaveType;
        if (! $type) {
            abort(422, 'The leave type of this request no longer exists.');
        }
        $totals = $this->yearTotalsByType((int) $leave->employee_id, (int) $leave->start_date->year, (int) $leave->id)[$type->id] ?? ['approved' => 0.0, 'pending' => 0.0];
        $remaining = max(0.0, (float) $type->annual_allowance - $totals['approved']);
        if ((float) $leave->total_days > $remaining) {
            abort(422, sprintf(
                'Approving would exceed the employee\'s %s allowance. Requested: %s days, Remaining: %s days.',
                $type->name,
                $this->formatDays((float) $leave->total_days),
                $this->formatDays($remaining),
            ));
        }
    }

    private function formatDays(float $days): string
    {
        return floor($days) === $days ? (string) (int) $days : (string) round($days, 2);
    }

    private function serialize(LeaveRequest $leave): array
    {
        return [
            'id' => (string) $leave->id,
            'status' => $leave->status,
            'employee' => $leave->employee ? ['id' => (string) $leave->employee->id, 'employee_id' => $leave->employee->employee_id, 'name' => $leave->employee->name, 'department' => $leave->employee->department?->name] : null,
            'leave_type' => $leave->leaveType ? ['id' => (string) $leave->leaveType->id, 'name' => $leave->leaveType->name, 'code' => $leave->leaveType->code, 'is_paid' => (bool) $leave->leaveType->is_paid] : null,
            'start_date' => $leave->start_date?->toDateString(),
            'end_date' => $leave->end_date?->toDateString(),
            'total_days' => (float) $leave->total_days,
            'reason' => $leave->reason,
            'review_note' => $leave->review_note,
            'reviewer' => $leave->reviewer ? ['id' => (string) $leave->reviewer->id, 'name' => $leave->reviewer->name] : null,
            'reviewed_at' => $leave->reviewed_at?->toIso8601String(),
            'created_at' => $leave->created_at?->toIso8601String(),
            'updated_at' => $leave->updated_at?->toIso8601String(),
        ];
    }
}
