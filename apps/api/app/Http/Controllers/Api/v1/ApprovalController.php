<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\Timesheet;
use App\Services\DataScopeService;
use App\Services\WorkforceScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApprovalController extends Controller
{
    public function __construct(
        private readonly WorkforceScopeService $scope,
        private readonly DataScopeService $dataScope,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        $this->scope->authorize($request, 'approval.view');

        $leaves = LeaveRequest::query()->where('status', 'pending')->with(['employee', 'leaveType']);
        $this->dataScope->applyEmployeeRelatedScope($leaves, $request->user(), (int) $org->id);

        if ($branch) {
            $leaves->where('branch_id', $branch->id);
        }

        $leaveItems = $leaves->orderBy('created_at')->get()->map(fn ($leave) => [
            'id' => 'leave-'.$leave->id,
            'entity_id' => (string) $leave->id,
            'type' => 'leave',
            'title' => $leave->employee?->name.' · '.$leave->leaveType?->name,
            'subtitle' => $leave->start_date?->toDateString().' → '.$leave->end_date?->toDateString().' · '.(float) $leave->total_days.' day(s)',
            'status' => 'pending',
            'submitted_at' => $leave->created_at?->toIso8601String(),
        ]);

        $timesheets = Timesheet::query()->where('status', 'pending')->with('employee');
        $this->dataScope->applyEmployeeRelatedScope($timesheets, $request->user(), (int) $org->id);

        if ($branch) {
            $timesheets->whereHas('employee', fn ($query) => $query->where('branch_id', $branch->id));
        }

        $timesheetItems = $timesheets->orderBy('date')->get()->map(fn ($timesheet) => [
            'id' => 'timesheet-'.$timesheet->id,
            'entity_id' => (string) $timesheet->id,
            'type' => 'timesheet',
            'title' => ($timesheet->employee?->name ?? 'Employee').' · Timesheet',
            'subtitle' => $timesheet->date?->toDateString().' · '.(float) $timesheet->total_hours.' hours',
            'status' => 'pending',
            'submitted_at' => $timesheet->updated_at?->toIso8601String(),
        ]);

        return $this->successResponse(
            $leaveItems->concat($timesheetItems)->sortBy('submitted_at')->values(),
        );
    }

    public function show(Request $request, string $approval): JsonResponse
    {
        $this->scope->authorize($request, 'approval.view');

        if (str_starts_with($approval, 'leave-')) {
            $id = (int) substr($approval, 6);
            $leave = LeaveRequest::with(['employee.department', 'leaveType', 'reviewer'])->findOrFail($id);
            $org = $this->scope->organization($request, true);
            abort_unless((int) $leave->organization_id === (int) $org->id, 404);
            $this->dataScope->assertEmployee($request->user(), (int) $org->id, (int) $leave->employee_id);

            return $this->successResponse([
                'id' => $approval,
                'type' => 'leave',
                'entity_id' => (string) $leave->id,
                'status' => $leave->status,
                'data' => [
                    'employee' => $leave->employee?->name,
                    'employee_id' => $leave->employee?->employee_id,
                    'department' => $leave->employee?->department?->name,
                    'leave_type' => $leave->leaveType?->name,
                    'start_date' => $leave->start_date?->toDateString(),
                    'end_date' => $leave->end_date?->toDateString(),
                    'total_days' => (float) $leave->total_days,
                    'reason' => $leave->reason,
                    'review_note' => $leave->review_note,
                ],
            ]);
        }

        if (str_starts_with($approval, 'timesheet-')) {
            $id = (int) substr($approval, 10);
            $timesheet = Timesheet::with('employee')->findOrFail($id);
            $org = $this->scope->organization($request, true);
            abort_unless((int) $timesheet->organization_id === (int) $org->id, 404);
            $this->dataScope->assertEmployee($request->user(), (int) $org->id, (int) $timesheet->employee_id);

            return $this->successResponse([
                'id' => $approval,
                'type' => 'timesheet',
                'entity_id' => (string) $timesheet->id,
                'status' => $timesheet->status,
                'data' => [
                    'employee' => $timesheet->employee?->name,
                    'employee_id' => $timesheet->employee?->employee_id,
                    'date' => $timesheet->date?->toDateString(),
                    'clock_in' => $timesheet->clock_in?->toIso8601String(),
                    'clock_out' => $timesheet->clock_out?->toIso8601String(),
                    'total_hours' => (float) $timesheet->total_hours,
                ],
            ]);
        }

        abort(404);
    }

    public function approve(Request $request, string $approval): JsonResponse
    {
        return $this->review($request, $approval, 'approved');
    }

    public function reject(Request $request, string $approval): JsonResponse
    {
        return $this->review($request, $approval, 'rejected');
    }

    private function review(Request $request, string $approval, string $status): JsonResponse
    {
        $this->scope->authorize($request, 'approval.approve');
        $org = $this->scope->organization($request, true);

        if (str_starts_with($approval, 'leave-')) {
            $leave = LeaveRequest::whereKey((int) substr($approval, 6))->where('organization_id', $org->id)->firstOrFail();
            $this->dataScope->assertEmployee($request->user(), (int) $org->id, (int) $leave->employee_id);

            if ((int) ($leave->employee?->user_id ?? $leave->employee()->value('user_id') ?? 0) === (int) $request->user()->id) {
                abort(409, 'Maker and checker must be different users.');
            }

            if ($leave->status !== 'pending') {
                abort(409, 'Approval is no longer pending.');
            }

            $data = $request->validate([
                'review_note' => ['nullable', 'string', 'max:2000'],
            ]);

            $leave->update([
                'status' => $status,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
                'review_note' => $data['review_note'] ?? null,
            ]);

            return $this->successResponse(['id' => $approval, 'status' => $status], 'Approval '.$status);
        }

        if (str_starts_with($approval, 'timesheet-')) {
            $timesheet = Timesheet::whereKey((int) substr($approval, 10))->where('organization_id', $org->id)->firstOrFail();
            $this->dataScope->assertEmployee($request->user(), (int) $org->id, (int) $timesheet->employee_id);

            if ((int) ($timesheet->employee?->user_id ?? $timesheet->employee()->value('user_id') ?? 0) === (int) $request->user()->id) {
                abort(409, 'Maker and checker must be different users.');
            }

            if ($timesheet->status !== 'pending') {
                abort(409, 'Approval is no longer pending.');
            }

            $timesheet->update(['status' => $status]);

            return $this->successResponse(['id' => $approval, 'status' => $status], 'Approval '.$status);
        }

        abort(404);
    }
}
