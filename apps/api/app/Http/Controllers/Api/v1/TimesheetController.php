<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Timesheets\ClockInRequest;
use App\Http\Requests\Timesheets\ClockOutRequest;
use App\Http\Requests\Timesheets\ListTimesheetsRequest;
use App\Http\Requests\Timesheets\StoreTimesheetRequest;
use App\Http\Requests\Timesheets\TodayTimesheetRequest;
use App\Http\Requests\Timesheets\UpdateTimesheetRequest;
use App\Http\Resources\TimesheetResource;
use App\Models\Timesheet;
use App\Services\TimesheetService;
use App\Services\WorkforceScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimesheetController extends Controller
{
    public function __construct(
        private readonly TimesheetService $timesheetService,
        private readonly WorkforceScopeService $scope,
    ) {}

    public function index(ListTimesheetsRequest $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        $filters = $request->validated();
        $filters['organization_id'] = $org->id;
        if ($branch) {
            $filters['branch_id'] = $branch->id;
        }
        $paginator = $this->timesheetService->paginate($request->user(), $filters);

        return $this->successResponse(TimesheetResource::collection($paginator), 'Timesheets retrieved successfully');
    }

    public function today(TodayTimesheetRequest $request): JsonResponse
    {
        $this->scope->organization($request, true);
        $validated = $request->validated();
        $state = $this->timesheetService->today($request->user(), isset($validated['employee_id']) ? (int) $validated['employee_id'] : null);

        return $this->successResponse([
            'employee_profile_linked' => $state['employee_profile_linked'],
            'is_clocked_in' => $state['is_clocked_in'],
            'active_timesheet' => $state['active_timesheet'] ? (new TimesheetResource($state['active_timesheet']))->resolve($request) : null,
            'today' => $state['today'],
            'total_today_hours' => $state['total_today_hours'],
        ]);
    }

    public function show(Request $request, Timesheet $timesheet): JsonResponse
    {
        $this->assertScoped($request, $timesheet);

        return $this->successResponse(new TimesheetResource($this->timesheetService->accessible($request->user(), $timesheet)));
    }

    public function clockIn(ClockInRequest $request): JsonResponse
    {
        $this->scope->organization($request, true);
        $validated = $request->validated();
        $timesheet = $this->timesheetService->clockIn($request->user(), isset($validated['employee_id']) ? (int) $validated['employee_id'] : null);
        $this->assertScoped($request, $timesheet);

        return $this->successResponse(new TimesheetResource($timesheet), 'Clocked in successfully', 201);
    }

    public function clockOut(ClockOutRequest $request): JsonResponse
    {
        $this->scope->organization($request, true);
        $validated = $request->validated();
        $timesheet = $this->timesheetService->clockOut($request->user(), isset($validated['employee_id']) ? (int) $validated['employee_id'] : null);
        $this->assertScoped($request, $timesheet);

        return $this->successResponse(new TimesheetResource($timesheet), 'Clocked out successfully');
    }

    public function store(StoreTimesheetRequest $request): JsonResponse
    {
        $this->scope->organization($request, true);
        $timesheet = $this->timesheetService->create($request->user(), $request->validated());
        $this->assertScoped($request, $timesheet);

        return $this->successResponse(new TimesheetResource($timesheet), 'Timesheet created successfully', 201);
    }

    public function update(UpdateTimesheetRequest $request, Timesheet $timesheet): JsonResponse
    {
        $this->assertScoped($request, $timesheet);
        $timesheet = $this->timesheetService->update($request->user(), $timesheet, $request->validated());

        return $this->successResponse(new TimesheetResource($timesheet), 'Timesheet updated successfully');
    }

    public function destroy(Request $request, Timesheet $timesheet): JsonResponse
    {
        $this->assertScoped($request, $timesheet);
        $this->timesheetService->delete($request->user(), $timesheet);

        return $this->successResponse(null, 'Timesheet deleted successfully');
    }

    private function assertScoped(Request $request, Timesheet $timesheet): void
    {
        $org = $this->scope->organization($request, true);
        $branch = $this->scope->branch($request, false);
        abort_unless((int) $timesheet->organization_id === (int) $org->id, 404);
        if ($branch) {
            $timesheet->loadMissing('employee');
            abort_unless((int) $timesheet->employee?->branch_id === (int) $branch->id, 404);
        }
    }
}
