<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Timesheet;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class TimesheetService
{
    /**
     * Standard scheduled work hours per day.
     */
    public const DEFAULT_SCHEDULED_HOURS = 8.00;

    /**
     * Validate that the requested time span for an employee does not overlap with any existing records.
     *
     * @param  Carbon|string  $clockIn
     * @param  Carbon|string|null  $clockOut
     *
     * @throws ValidationException|ConflictHttpException
     */
    public function validateNoOverlap(int $employeeId, mixed $clockIn, mixed $clockOut = null, ?int $ignoreId = null): void
    {
        $clockInTime = $clockIn instanceof Carbon ? $clockIn : Carbon::parse($clockIn);
        $clockOutTime = $clockOut ? ($clockOut instanceof Carbon ? $clockOut : Carbon::parse($clockOut)) : null;

        if ($clockOutTime !== null && $clockOutTime->lessThanOrEqualTo($clockInTime)) {
            throw ValidationException::withMessages([
                'clock_out' => ['Clock out time must be strictly after clock in time.'],
            ]);
        }

        // 1. Check for active/open sessions (clock_out IS NULL)
        $openSessionQuery = Timesheet::query()
            ->where('employee_id', $employeeId)
            ->whereNull('clock_out');

        if ($ignoreId) {
            $openSessionQuery->where('id', '!=', $ignoreId);
        }

        $activeSession = $openSessionQuery->first();

        // If the new/updated entry is an open session (clock_out IS NULL)
        if ($clockOutTime === null) {
            if ($activeSession) {
                throw new ConflictHttpException('An active work session is already in progress. Please clock out before starting a new session.');
            }

            // Ensure the open session start time doesn't fall inside or before any existing closed session
            $overlappingClosed = Timesheet::query()
                ->where('employee_id', $employeeId)
                ->whereNotNull('clock_out')
                ->where(function ($q) use ($clockInTime) {
                    $q->where('clock_in', '<=', $clockInTime)
                        ->where('clock_out', '>', $clockInTime);
                });

            if ($ignoreId) {
                $overlappingClosed->where('id', '!=', $ignoreId);
            }

            $closedConflict = $overlappingClosed->first();
            if ($closedConflict) {
                $conflictStart = Carbon::parse($closedConflict->clock_in)->format('H:i:s');
                $conflictEnd = Carbon::parse($closedConflict->clock_out)->format('H:i:s');
                throw new ConflictHttpException("The clock-in time overlaps with an existing completed shift ({$conflictStart} - {$conflictEnd}).");
            }

            return;
        }

        // If the entry has both clock_in and clock_out (closed session)
        // Check if an existing open session conflicts with this range
        if ($activeSession) {
            $activeStart = Carbon::parse($activeSession->clock_in);
            // If the active session started before or during this span
            if ($activeStart->lessThan($clockOutTime)) {
                throw new ConflictHttpException('The specified time span overlaps with the current active open session.');
            }
        }

        // Check against all closed records for overlap:
        // Overlap exists if: (existing.clock_in < new.clock_out) AND (existing.clock_out > new.clock_in)
        $overlapQuery = Timesheet::query()
            ->where('employee_id', $employeeId)
            ->whereNotNull('clock_out')
            ->where('clock_in', '<', $clockOutTime)
            ->where('clock_out', '>', $clockInTime);

        if ($ignoreId) {
            $overlapQuery->where('id', '!=', $ignoreId);
        }

        $overlapRecord = $overlapQuery->first();
        if ($overlapRecord) {
            $overlapStart = Carbon::parse($overlapRecord->clock_in)->format('Y-m-d H:i:s');
            $overlapEnd = Carbon::parse($overlapRecord->clock_out)->format('Y-m-d H:i:s');
            $proposedStart = $clockInTime->format('Y-m-d H:i:s');
            $proposedEnd = $clockOutTime->format('Y-m-d H:i:s');

            throw ValidationException::withMessages([
                'time_span' => [
                    "The time span ({$proposedStart} to {$proposedEnd}) overlaps with an existing timesheet record ({$overlapStart} to {$overlapEnd}).",
                ],
            ]);
        }
    }

    /**
     * Start a new live work session (clock in).
     */
    public function clockIn(int $employeeId, array $data = []): Timesheet
    {
        $employee = Employee::findOrFail($employeeId);
        $now = isset($data['clock_in']) ? Carbon::parse($data['clock_in']) : Carbon::now();
        $date = isset($data['date']) ? Carbon::parse($data['date'])->toDateString() : $now->toDateString();

        $this->validateNoOverlap($employeeId, $now, null);

        return Timesheet::create([
            'organization_id' => $employee->organization_id,
            'employee_id' => $employee->id,
            'date' => $date,
            'clock_in' => $now,
            'clock_out' => null,
            'total_hours' => 0.00,
            'status' => $data['status'] ?? 'present',
        ]);
    }

    /**
     * End the current active work session (clock out).
     */
    public function clockOut(int $employeeId, array $data = []): Timesheet
    {
        $activeSession = Timesheet::query()
            ->where('employee_id', $employeeId)
            ->whereNull('clock_out')
            ->orderBy('clock_in', 'desc')
            ->first();

        if (! $activeSession) {
            throw new ConflictHttpException('No active work session found to clock out from.');
        }

        $clockOutTime = isset($data['clock_out']) ? Carbon::parse($data['clock_out']) : Carbon::now();
        $clockInTime = Carbon::parse($activeSession->clock_in);

        $this->validateNoOverlap($employeeId, $clockInTime, $clockOutTime, $activeSession->id);

        $diffInSeconds = max(0, $clockOutTime->diffInSeconds($clockInTime));
        $totalHours = round($diffInSeconds / 3600, 2);

        $activeSession->update([
            'clock_out' => $clockOutTime,
            'total_hours' => $totalHours,
            'status' => $data['status'] ?? $activeSession->status ?? 'present',
        ]);

        return $activeSession->fresh(['employee', 'organization']);
    }

    /**
     * Create a manual historical or pre-scheduled timesheet entry.
     */
    public function createTimesheet(array $data): Timesheet
    {
        $employee = Employee::findOrFail($data['employee_id']);
        $clockIn = Carbon::parse($data['clock_in']);
        $clockOut = isset($data['clock_out']) && ! empty($data['clock_out']) ? Carbon::parse($data['clock_out']) : null;
        $date = isset($data['date']) ? Carbon::parse($data['date'])->toDateString() : $clockIn->toDateString();

        $this->validateNoOverlap($employee->id, $clockIn, $clockOut);

        $totalHours = 0.00;
        if ($clockOut !== null) {
            $diffInSeconds = max(0, $clockOut->diffInSeconds($clockIn));
            $totalHours = round($diffInSeconds / 3600, 2);
        }

        return Timesheet::create([
            'organization_id' => $data['organization_id'] ?? $employee->organization_id,
            'employee_id' => $employee->id,
            'date' => $date,
            'clock_in' => $clockIn,
            'clock_out' => $clockOut,
            'total_hours' => $data['total_hours'] ?? $totalHours,
            'status' => $data['status'] ?? 'present',
        ]);
    }

    /**
     * Update an existing timesheet record.
     */
    public function updateTimesheet(Timesheet $timesheet, array $data): Timesheet
    {
        $employeeId = $data['employee_id'] ?? $timesheet->employee_id;
        $clockIn = isset($data['clock_in']) ? Carbon::parse($data['clock_in']) : Carbon::parse($timesheet->clock_in);
        $clockOut = array_key_exists('clock_out', $data)
            ? ($data['clock_out'] ? Carbon::parse($data['clock_out']) : null)
            : ($timesheet->clock_out ? Carbon::parse($timesheet->clock_out) : null);
        $date = isset($data['date']) ? Carbon::parse($data['date'])->toDateString() : $timesheet->date?->toDateString() ?? $clockIn->toDateString();

        $this->validateNoOverlap($employeeId, $clockIn, $clockOut, $timesheet->id);

        $totalHours = $timesheet->total_hours;
        if ($clockOut !== null) {
            $diffInSeconds = max(0, $clockOut->diffInSeconds($clockIn));
            $totalHours = round($diffInSeconds / 3600, 2);
        }

        $timesheet->update([
            'employee_id' => $employeeId,
            'date' => $date,
            'clock_in' => $clockIn,
            'clock_out' => $clockOut,
            'total_hours' => $data['total_hours'] ?? $totalHours,
            'status' => $data['status'] ?? $timesheet->status,
        ]);

        return $timesheet->fresh(['employee', 'organization']);
    }

    /**
     * Retrieve today's work summary, active session, live elapsed time, and remaining scheduled hours.
     */
    public function getTodaySummary(int $employeeId, mixed $date = null): array
    {
        $targetDate = $date ? Carbon::parse($date)->toDateString() : Carbon::today()->toDateString();

        $activeSession = Timesheet::query()
            ->where('employee_id', $employeeId)
            ->whereNull('clock_out')
            ->with(['employee', 'organization'])
            ->first();

        // Calculate completed shift hours for today
        $closedHoursToday = (float) Timesheet::query()
            ->where('employee_id', $employeeId)
            ->whereDate('date', $targetDate)
            ->whereNotNull('clock_out')
            ->sum('total_hours');

        $activeSessionSeconds = 0;
        $activeSessionHours = 0.00;

        if ($activeSession && $activeSession->clock_in) {
            $clockInTime = Carbon::parse($activeSession->clock_in);
            $activeSessionSeconds = max(0, Carbon::now()->diffInSeconds($clockInTime));
            $activeSessionHours = round($activeSessionSeconds / 3600, 2);
        }

        $totalTodayHours = round($closedHoursToday + $activeSessionHours, 2);
        $scheduledHours = self::DEFAULT_SCHEDULED_HOURS;
        $remainingHours = max(0.00, round($scheduledHours - $totalTodayHours, 2));

        return [
            'is_clocked_in' => $activeSession !== null,
            'active_timesheet' => $activeSession,
            'today' => $targetDate,
            'total_today_hours' => $totalTodayHours,
            'scheduled_hours' => $scheduledHours,
            'remaining_hours' => $remainingHours,
            'current_session_seconds' => $activeSessionSeconds,
        ];
    }
}
