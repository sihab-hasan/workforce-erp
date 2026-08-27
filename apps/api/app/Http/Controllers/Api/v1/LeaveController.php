<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\WorkforceNotification;
use App\Services\OrganizationAccessService;
use App\Services\WorkforceScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class LeaveController extends Controller
{
    private const MANAGER_ROLES = ['owner', 'admin', 'manager'];

    public function __construct(
        private readonly WorkforceScopeService $scope,
        private readonly OrganizationAccessService $access,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        $role = $this->scope->role($request);
        $query = LeaveRequest::query()->where('organization_id', $org->id)
            ->with(['employee.department', 'leaveType', 'reviewer']);
        if ($branch) {
            $query->where('branch_id', $branch->id);
        }

        $isManager = in_array($role, self::MANAGER_ROLES, true);
        if (! $isManager || $request->boolean('mine')) {
            $employeeIds = $this->access->ownEmployeeIds($request->user(), [(int) $org->id]);
            $query->whereIn('employee_id', $employeeIds ?: [0]);
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
        $types = LeaveType::query()->where('organization_id', $org->id)->where('is_active', true)->orderBy('name')->get();
        $ownEmployeeId = $this->access->ownEmployeeIds($request->user(), [(int) $org->id])[0] ?? null;
        $used = $ownEmployeeId ? LeaveRequest::query()->where('employee_id', $ownEmployeeId)->where('status', 'approved')->whereYear('start_date', now()->year)->selectRaw('leave_type_id, SUM(total_days) as used')->groupBy('leave_type_id')->pluck('used', 'leave_type_id') : collect();

        return $this->successResponse([
            'types' => $types->map(fn ($type) => [
                'id' => (string) $type->id,
                'name' => $type->name,
                'code' => $type->code,
                'annual_allowance' => (float) $type->annual_allowance,
                'is_paid' => (bool) $type->is_paid,
                'used' => (float) ($used[$type->id] ?? 0),
                'remaining' => max(0, (float) $type->annual_allowance - (float) ($used[$type->id] ?? 0)),
            ])->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        $role = $this->scope->role($request);
        $data = $request->validate([
            'employee_id' => ['nullable', 'integer', Rule::exists('employees', 'id')->where('organization_id', $org->id)],
            'leave_type_id' => ['required', 'integer', Rule::exists('leave_types', 'id')->where('organization_id', $org->id)],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['nullable', 'string', 'max:5000'],
        ]);
        $ownEmployeeIds = $this->access->ownEmployeeIds($request->user(), [(int) $org->id]);
        $employeeId = isset($data['employee_id']) ? (int) $data['employee_id'] : ($ownEmployeeIds[0] ?? 0);
        $isManager = in_array($role, self::MANAGER_ROLES, true);
        if (! $employeeId || (! $isManager && ! in_array($employeeId, $ownEmployeeIds, true))) {
            abort(403, 'You cannot submit leave for this employee.');
        }
        $employee = Employee::query()->whereKey($employeeId)->where('organization_id', $org->id)->firstOrFail();
        if ($branch && (int) $employee->branch_id !== (int) $branch->id) {
            abort(422, 'Employee does not belong to the selected company.');
        }

        $start = Carbon::parse($data['start_date'])->startOfDay();
        $end = Carbon::parse($data['end_date'])->startOfDay();
        $days = $start->diffInDays($end) + 1;
        $overlap = LeaveRequest::query()->where('employee_id', $employee->id)->whereIn('status', ['pending', 'approved'])
            ->where(fn ($q) => $q->whereBetween('start_date', [$start->toDateString(), $end->toDateString()])->orWhereBetween('end_date', [$start->toDateString(), $end->toDateString()])->orWhere(fn ($q2) => $q2->whereDate('start_date', '<=', $start)->whereDate('end_date', '>=', $end)))->exists();
        if ($overlap) {
            abort(409, 'This employee already has an overlapping leave request.');
        }

        $leave = LeaveRequest::create([
            ...$data,
            'employee_id' => $employee->id,
            'organization_id' => $org->id,
            'branch_id' => $employee->branch_id,
            'total_days' => $days,
            'status' => 'pending',
        ])->load(['employee.department', 'leaveType', 'reviewer']);
        $this->notifyManagers($org->id, $request->user()->id, 'leave.requested', 'Leave approval required', $employee->name.' submitted a leave request.', '/approvals');

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
        if (! in_array($leaveRequest->status, ['pending', 'approved'], true)) {
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
        $this->scope->assertRole($request, self::MANAGER_ROLES);
        if ($leaveRequest->status !== 'pending') {
            abort(409, 'Only pending leave requests can be reviewed.');
        }
        $data = $request->validate(['review_note' => ['nullable', 'string', 'max:2000']]);
        $leaveRequest->update([
            'status' => $status,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'review_note' => $data['review_note'] ?? null,
        ]);
        if ($leaveRequest->employee?->user_id) {
            WorkforceNotification::create([
                'organization_id' => $leaveRequest->organization_id,
                'user_id' => $leaveRequest->employee->user_id,
                'type' => 'leave.'.$status,
                'title' => 'Leave request '.ucfirst($status),
                'message' => 'Your leave request from '.$leaveRequest->start_date->toDateString().' to '.$leaveRequest->end_date->toDateString().' was '.$status.'.',
                'action_url' => '/leave/'.$leaveRequest->id,
            ]);
        }

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
        $role = $this->scope->role($request);
        if (! $ownRequired && in_array($role, self::MANAGER_ROLES, true)) {
            return;
        }
        $own = $this->access->ownEmployeeIds($request->user(), [(int) $leave->organization_id]);
        abort_unless(in_array((int) $leave->employee_id, $own, true), 403);
    }

    private function notifyManagers(int $organizationId, int $excludeUserId, string $type, string $title, string $message, string $actionUrl): void
    {
        $userIds = \App\Models\OrganizationMember::query()->where('organization_id', $organizationId)->where('status', 'active')->whereIn('role', self::MANAGER_ROLES)->where('user_id', '!=', $excludeUserId)->pluck('user_id');
        foreach ($userIds as $userId) {
            WorkforceNotification::create([
                'organization_id' => $organizationId, 'user_id' => $userId, 'type' => $type,
                'title' => $title, 'message' => $message, 'action_url' => $actionUrl,
            ]);
        }
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
