<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Services\SessionSecurityService;
use App\Services\SodService;
use App\Services\WorkforceScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    public function __construct(
        private readonly WorkforceScopeService $scope,
        private readonly SessionSecurityService $sessions,
        private readonly SodService $sod,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $this->scope->authorize($request, 'role.view');

        $roles = Role::query()
            ->where('organization_id', $org->id)
            ->with('permissions')
            ->withCount('membershipAssignments')
            ->orderBy('name')
            ->get()
            ->map(fn ($role) => $this->serialize($role));

        return $this->successResponse([
            'roles' => $roles,
            'permissions' => Permission::query()
                ->orderBy('name')
                ->get()
                ->map(fn ($permission) => [
                    'id' => (string) $permission->id,
                    'name' => $permission->name,
                    'description' => $permission->description,
                ]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $this->scope->authorize($request, 'role.manage');
        $this->sessions->requireRecentVerification($request);

        $data = $this->payload($request, null, (int) $org->id);
        $this->sod->assertPermissionSet((int) $org->id, $data['permissions'] ?? []);

        $role = Role::create([
            'organization_id' => $org->id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
        ]);

        $this->syncPermissions($role, $data['permissions'] ?? []);

        return $this->successResponse(
            $this->serialize($role->load('permissions')->loadCount('membershipAssignments')),
            'Role created successfully',
            201,
        );
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        abort_unless((int) $role->organization_id === (int) $org->id, 404);
        $this->scope->authorize($request, 'role.manage');
        $this->sessions->requireRecentVerification($request);

        if (in_array($role->name, ['organization_owner'], true) && $request->input('name', $role->name) !== $role->name) {
            abort(409, 'The system owner role cannot be renamed.');
        }

        $data = $this->payload($request, $role, (int) $org->id);

        if (array_key_exists('permissions', $data)) {
            $this->sod->assertPermissionSet((int) $org->id, $data['permissions']);
        }

        $role->update([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
        ]);

        if (array_key_exists('permissions', $data)) {
            $this->syncPermissions($role, $data['permissions']);
        }

        return $this->successResponse(
            $this->serialize($role->fresh()->load('permissions')->loadCount('membershipAssignments')),
            'Role updated successfully',
        );
    }

    public function destroy(Request $request, Role $role): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        abort_unless((int) $role->organization_id === (int) $org->id, 404);
        $this->scope->authorize($request, 'role.manage');
        $this->sessions->requireRecentVerification($request);

        if (in_array($role->name, ['organization_owner', 'organization_admin', 'manager', 'employee', 'auditor'], true)) {
            abort(409, 'Default security roles cannot be deleted.');
        }

        if ($role->membershipAssignments()->exists() || $role->employees()->exists()) {
            abort(409, 'This role is assigned and cannot be deleted.');
        }

        $role->delete();

        return $this->successResponse(null, 'Role deleted successfully');
    }

    private function payload(Request $request, ?Role $role, int $organizationId): array
    {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('roles', 'name')
                    ->where('organization_id', $organizationId)
                    ->ignore($role?->id),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'permissions' => ['sometimes', 'array', 'max:250'],
            'permissions.*' => ['string', 'max:120', 'distinct', 'exists:permissions,name'],
        ]);
    }

    private function syncPermissions(Role $role, array $permissionNames): void
    {
        $uniqueNames = collect($permissionNames)->unique()->values();
        $permissions = Permission::query()->whereIn('name', $uniqueNames)->get(['id', 'name']);

        if ($permissions->count() !== $uniqueNames->count()) {
            abort(422, 'One or more permission keys are not in the permission catalog.');
        }

        $role->permissions()->sync($permissions->pluck('id')->all());
    }

    private function serialize(Role $role): array
    {
        return [
            'id' => (string) $role->id,
            'name' => $role->name,
            'description' => $role->description,
            'assignments_count' => (int) ($role->membership_assignments_count ?? $role->membershipAssignments()->count()),
            'permissions' => $role->permissions->pluck('name')->values(),
            'created_at' => $role->created_at?->toIso8601String(),
        ];
    }
}
