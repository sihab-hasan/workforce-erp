<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Timesheet\ClockInRequest;
use App\Http\Requests\Timesheet\ClockOutRequest;
use App\Http\Requests\Timesheet\StoreTimesheetRequest;
use App\Http\Requests\Timesheet\UpdateTimesheetRequest;
use App\Http\Resources\TimesheetResource;
use App\Models\Employee;
use App\Models\Timesheet;
use App\Services\TimesheetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TimesheetController extends Controller
{
    public function __construct(
        protected TimesheetService $timesheetService
    ) {}

    /**
     * Display a paginated listing of timesheets.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Timesheet::query()->with(['employee', 'organization']);

        // Scope to user's organizations
        $orgIds = $user ? $user->organizations()->pluck('organizations.id')->toArray() : [];
        if (! empty($orgIds)) {
            $query->whereIn('organization_id', $orgIds);
        }

        // Filter by employee ID
        if ($request->has('employee_id') && ! empty($request->input('employee_id'))) {
            $query->where('employee_id', $request->input('employee_id'));
        }

        // Filter by date range (start_date)
        if ($request->has('start_date') && ! empty($request->input('start_date'))) {
            $startDate = \Illuminate\Support\Carbon::parse($request->input('start_date'))->startOfDay()->toDateTimeString();
            $query->where('date', '>=', $startDate);
        }

        // Filter by date range (end_date)
        if ($request->has('end_date') && ! empty($request->input('end_date'))) {
            $endDate = \Illuminate\Support\Carbon::parse($request->input('end_date'))->endOfDay()->toDateTimeString();
            $query->where('date', '<=', $endDate);
        }

        // Filter by status
        if ($request->has('status') && $request->input('status') !== 'all' && ! empty($request->input('status'))) {
            $query->where('status', $request->input('status'));
        }

        // Search by employee name or email
        if ($request->has('search') && ! empty($request->input('search'))) {
            $search = $request->input('search');
            $query->whereHas('employee', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Order by date and clock_in descending to show recent shift logs first
        $query->orderBy('date', 'desc')->orderBy('clock_in', 'desc');

        $perPage = (int) $request->input('per_page', 15);
        $paginator = $query->paginate($perPage);

        return $this->successResponse(TimesheetResource::collection($paginator), 'Timesheets retrieved successfully');
    }

    /**
     * Retrieve today's active status, tracking, and remaining scheduled work time.
     */
    public function today(Request $request): JsonResponse
    {
        $employeeId = $this->resolveEmployeeId($request);
        $summary = $this->timesheetService->getTodaySummary($employeeId, $request->input('date'));

        $data = [
            'is_clocked_in' => $summary['is_clocked_in'],
            'active_timesheet' => $summary['active_timesheet'] ? new TimesheetResource($summary['active_timesheet']) : null,
            'today' => $summary['today'],
            'total_today_hours' => $summary['total_today_hours'],
            'scheduled_hours' => $summary['scheduled_hours'],
            'remaining_hours' => $summary['remaining_hours'],
            'current_session_seconds' => $summary['current_session_seconds'],
        ];

        return $this->successResponse($data, "Today's timesheet status retrieved successfully");
    }

    /**
     * Start a new work session (Clock In).
     */
    public function clockIn(ClockInRequest $request): JsonResponse
    {
        $employeeId = $this->resolveEmployeeId($request);
        $timesheet = $this->timesheetService->clockIn($employeeId, $request->validated());

        return $this->successResponse(new TimesheetResource($timesheet), 'Clocked in successfully', 201);
    }

    /**
     * End current active work session (Clock Out).
     */
    public function clockOut(ClockOutRequest $request): JsonResponse
    {
        $employeeId = $this->resolveEmployeeId($request);
        $timesheet = $this->timesheetService->clockOut($employeeId, $request->validated());

        return $this->successResponse(new TimesheetResource($timesheet), 'Clocked out successfully');
    }

    /**
     * Create a manual timesheet record with overlap validation.
     */
    public function store(StoreTimesheetRequest $request): JsonResponse
    {
        $data = $request->validated();
        $timesheet = $this->timesheetService->createTimesheet($data);

        return $this->successResponse(new TimesheetResource($timesheet), 'Timesheet created successfully', 201);
    }

    /**
     * View a single timesheet record.
     */
    public function show(string $id): JsonResponse
    {
        $timesheet = Timesheet::with(['employee', 'organization'])->findOrFail($id);

        return $this->successResponse(new TimesheetResource($timesheet), 'Timesheet retrieved successfully');
    }

    /**
     * Update an existing timesheet record with overlap validation.
     */
    public function update(UpdateTimesheetRequest $request, string $id): JsonResponse
    {
        $timesheet = Timesheet::findOrFail($id);
        $updated = $this->timesheetService->updateTimesheet($timesheet, $request->validated());

        return $this->successResponse(new TimesheetResource($updated), 'Timesheet updated successfully');
    }

    /**
     * Delete a timesheet record.
     */
    public function destroy(string $id): JsonResponse
    {
        $timesheet = Timesheet::findOrFail($id);
        $timesheet->delete();

        return $this->successResponse(null, 'Timesheet deleted successfully');
    }

    /**
     * Resolve employee ID from request or authenticated user.
     */
    protected function resolveEmployeeId(Request $request): int
    {
        if ($request->filled('employee_id')) {
            return (int) $request->input('employee_id');
        }

        $user = $request->user();
        if ($user) {
            $employee = $user->employees()->first() ?? Employee::where('email', $user->email)->first();
            if ($employee) {
                return (int) $employee->id;
            }
        }

        $firstEmployee = Employee::first();
        if ($firstEmployee) {
            return (int) $firstEmployee->id;
        }

        throw new NotFoundHttpException('No employee record found for timesheet action.');
    }
}
