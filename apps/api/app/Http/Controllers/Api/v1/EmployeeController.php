<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    /**
     * Display a paginated listing of employees.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Employee::query()->with(['organization', 'branch', 'department', 'designation', 'manager']);

        // Scope to user's organizations
        $orgIds = $user ? $user->organizations()->pluck('organizations.id')->toArray() : [];
        if (! empty($orgIds)) {
            $query->whereIn('organization_id', $orgIds);
        }

        // Filter by department (ID, name, or code)
        if ($request->has('department') && $request->input('department') !== 'all' && ! empty($request->input('department'))) {
            $dep = $request->input('department');
            $query->whereHas('department', function ($q) use ($dep) {
                $q->where('id', $dep)
                    ->orWhere('name', $dep)
                    ->orWhere('code', $dep);
            });
        }

        // Filter by location/branch (ID, name, or code)
        if ($request->has('location') && $request->input('location') !== 'all' && ! empty($request->input('location'))) {
            $loc = $request->input('location');
            $query->whereHas('branch', function ($q) use ($loc) {
                $q->where('id', $loc)
                    ->orWhere('name', $loc)
                    ->orWhere('code', $loc);
            });
        }

        // Filter by status
        if ($request->has('status') && $request->input('status') !== 'all' && ! empty($request->input('status'))) {
            $query->where('status', $request->input('status'));
        }

        // Search by first_name, last_name, email, or employee_id
        if ($request->has('search') && ! empty($request->input('search'))) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->input('per_page', 15);
        $paginator = $query->paginate($perPage);

        return $this->successResponse(EmployeeResource::collection($paginator), 'Employees retrieved successfully');
    }
}
