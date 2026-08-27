<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Services\WorkforceScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    public function __construct(private readonly WorkforceScopeService $scope) {}

    public function index(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $this->scope->assertRole($request, ['owner', 'admin']);
        $roles = Role::query()->where('organization_id', $org->id)->with('permissions')->withCount('employees')->orderBy('name')->get()->map(fn ($role) => $this->serialize($role));

        return $this->successResponse(['roles' => $roles, 'permissions' => Permission::query()->orderBy('name')->get()->map(fn ($p) => ['id' => (string) $p->id, 'name' => $p->name, 'description' => $p->description])]);
    }

    public function store(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $this->scope->assertRole($request, ['owner', 'admin']);
        $data = $this->payload($request, null, (int) $org->id);
        $role = Role::create(['organization_id' => $org->id, 'name' => $data['name'], 'description' => $data['description'] ?? null]);
        $this->syncPermissions($role, $data['permissions'] ?? []);

        return $this->successResponse($this->serialize($role->load('permissions')->loadCount('employees')), 'Role created successfully', 201);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        abort_unless((int) $role->organization_id === (int) $org->id, 404);
        $this->scope->assertRole($request, ['owner', 'admin']);
        $data = $this->payload($request, $role, (int) $org->id);
        $role->update(['name' => $data['name'], 'description' => $data['description'] ?? null]);
        if (array_key_exists('permissions', $data)) {
            $this->syncPermissions($role, $data['permissions']);
        }

        return $this->successResponse($this->serialize($role->fresh()->load('permissions')->loadCount('employees')), 'Role updated successfully');
    }

    public function destroy(Request $request, Role $role): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        abort_unless((int) $role->organization_id === (int) $org->id, 404);
        $this->scope->assertRole($request, ['owner']);
        if ($role->employees()->exists()) {
            abort(409, 'This role is assigned to employees.');
        }
        $role->delete();

        return $this->successResponse(null, 'Role deleted successfully');
    }

    private function payload(Request $request, ?Role $role, int $organizationId): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('roles', 'name')->where('organization_id', $organizationId)->ignore($role?->id)],
            'description' => ['nullable', 'string', 'max:1000'],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['string', 'max:120'],
        ]);
    }

    private function syncPermissions(Role $role, array $names): void
    {
        $ids = collect($names)->unique()->map(fn ($name) => Permission::firstOrCreate(['name' => $name], ['description' => str_replace('.', ' ', ucwords((string) $name, '.'))])->id)->all();
        $role->permissions()->sync($ids);
    }

    private function serialize(Role $role): array
    {
        return ['id' => (string) $role->id, 'name' => $role->name, 'description' => $role->description, 'employees_count' => (int) ($role->employees_count ?? $role->employees()->count()), 'permissions' => $role->permissions->pluck('name')->values(), 'created_at' => $role->created_at?->toIso8601String()];
    }
}
