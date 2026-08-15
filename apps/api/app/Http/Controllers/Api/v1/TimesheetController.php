<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TimesheetResource;
use App\Models\Timesheet;
use Illuminate\Http\Request;

class TimesheetController extends Controller
{
    /**
     * Display a paginated listing of timesheets.
     */
    public function index(Request $request)
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
}
