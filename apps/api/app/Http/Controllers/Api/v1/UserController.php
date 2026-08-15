<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a paginated listing of users.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = User::query()->with(['organizations', 'employees']);

        // Scope to user's organizations
        $orgIds = $user ? $user->organizations()->pluck('organizations.id')->toArray() : [];
        if (! empty($orgIds)) {
            $query->whereHas('organizations', function ($q) use ($orgIds) {
                $q->whereIn('organizations.id', $orgIds);
            });
        }

        // Filter by organization member role
        if ($request->has('role') && $request->input('role') !== 'all') {
            $role = $request->input('role');
            $query->whereHas('organizations', function ($q) use ($orgIds, $role) {
                if (! empty($orgIds)) {
                    $q->whereIn('organizations.id', $orgIds);
                }
                $q->where('organization_members.role', $role);
            });
        }

        // Filter by organization member status
        if ($request->has('status') && $request->input('status') !== 'all') {
            $status = $request->input('status');
            $query->whereHas('organizations', function ($q) use ($orgIds, $status) {
                if (! empty($orgIds)) {
                    $q->whereIn('organizations.id', $orgIds);
                }
                $q->where('organization_members.status', $status);
            });
        }

        // Search by user name or email
        if ($request->has('search') && ! empty($request->input('search'))) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->input('per_page', 15);
        $paginator = $query->paginate($perPage);

        return $this->successResponse(UserResource::collection($paginator), 'Users retrieved successfully');
    }
}
