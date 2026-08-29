<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class UserService
{
    public const USER_ROLES = ['owner', 'admin', 'manager', 'staff', 'readonly'];

    public const USER_STATUSES = ['active', 'inactive', 'invited', 'suspended'];

    public const SORTABLE_FIELDS = ['name', 'email', 'created_at', 'last_login_at'];

    private const ROLE_COMPAT = [
        'owner' => 'organization_owner',
        'admin' => 'organization_admin',
        'manager' => 'manager',
        'staff' => 'employee',
        'readonly' => 'auditor',
    ];

    public function __construct(
        private readonly AuthorizationService $authz,
        private readonly InvitationService $invitations,
        private readonly SessionSecurityService $sessions,
        private readonly SodService $sod,
        private readonly DataScopeService $dataScope,
    ) {}

    public function paginate(User $actor, array $filters): LengthAwarePaginator
    {
        $organizationIds = $this->authz->manageableOrganizationIds($actor, 'user.view');
        if ($organizationIds === []) {
            throw new AuthorizationException('You do not have permission to access Users & Access.');
        }

        if (! empty($filters['organization_id'])) {
            $id = (int) $filters['organization_id'];
            $this->authz->authorize($actor, $id, 'user.view');
            $organizationIds = [$id];
        }

        $query = User::query()
            ->with($this->relations($organizationIds))
            ->whereHas('memberships', fn ($query) => $query->whereIn('organization_id', $organizationIds));

        if (! empty($filters['role']) && $filters['role'] !== 'all') {
            $role = $this->compat((string) $filters['role']);
            $rawRole = (string) $filters['role'];
            $query->where(function ($q) use ($role, $rawRole) {
                $q->whereHas('memberships.roleAssignments.role', fn ($r) => $r->where('name', $role)->orWhere('name', $rawRole))
                    ->orWhereHas('memberships', fn ($m) => $m->where('role', $rawRole)->orWhere('role', $role));
            });
        }

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->whereHas('memberships', fn ($m) => $m->whereIn('organization_id', $organizationIds)->where('status', $filters['status']));
        }

        if (! empty($filters['search'])) {
            $search = trim((string) $filters['search']);
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
        }

        $requestedSort = (string) ($filters['sort_by'] ?? 'name');
        $sort = in_array($requestedSort, self::SORTABLE_FIELDS, true) ? $requestedSort : 'name';
        $direction = ($filters['sort_direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sort, $direction)->orderBy('users.id')->paginate((int) ($filters['per_page'] ?? 15));
    }

    public function accessible(User $actor, User $target): User
    {
        $org = $this->shared($actor, $target, 'user.view');

        return $target->load($this->relations([$org]));
    }

    public function invite(User $actor, array $data): User
    {
        $org = $this->resolve($actor, $data['organization_id'] ?? null, 'user.invite');
        $roles = $this->resolveRoles($org, $data['roles'] ?? ($data['role'] ?? null));
        $this->assertOwnerPermission($actor, $org, $roles);

        $permissions = $roles->flatMap(fn ($role) => $role->permissions()->pluck('name'))->unique()->values()->all();
        $this->sod->assertPermissionSet($org, $permissions);

        $scope = strtoupper((string) ($data['data_scope'] ?? 'OWN'));
        $result = $this->invitations->issue(
            $actor,
            $org,
            $data['email'],
            $roles->pluck('name')->all(),
            $scope,
            $data['scope_data'] ?? null,
            $data['name'],
        );

        $user = $result['invitation']->membership->user;
        if (! empty($data['employee_id'])) {
            $this->dataScope->assertEmployee($actor, $org, (int) $data['employee_id']);
            $this->linkEmployee($user, $org, (int) $data['employee_id']);
        }

        $user->setAttribute('invitation_delivered', $result['delivered'] ?? true);

        return $user->load($this->relations([$org]));
    }

    public function update(User $actor, User $target, array $data): User
    {
        $org = isset($data['organization_id']) ? (int) $data['organization_id'] : $this->shared($actor, $target, 'user.manage');
        $this->authz->authorize($actor, $org, 'user.manage');

        if (array_key_exists('email', $data) && Str::lower($data['email']) !== Str::lower($target->email)) {
            $target->update(['email' => Str::lower($data['email'])]);
        }

        if (isset($data['name'])) {
            $target->update(['name' => $data['name']]);
        }

        $rolesChanged = array_key_exists('roles', $data) || array_key_exists('role', $data);
        $scopeChanged = array_key_exists('data_scope', $data) || array_key_exists('scope_data', $data) || array_key_exists('expires_at', $data);

        if ($rolesChanged || $scopeChanged) {
            $membership = $target->memberships()->where('organization_id', $org)->firstOrFail();
            $roles = $rolesChanged
                ? $this->resolveRoles($org, $data['roles'] ?? ($data['role'] ?? null))
                : $membership->roleAssignments()->with('role')->get()->pluck('role')->filter()->values();

            if ($roles->isEmpty()) {
                abort(422, 'At least one role is required.');
            }

            $this->assertOwnerPermission($actor, $org, $roles);
            $hasOwner = $roles->contains(fn ($role) => $role->name === 'organization_owner');
            $this->ownerContinuity($membership, $hasOwner ? null : 'non_owner', null);

            $permissions = $roles->flatMap(fn ($role) => $role->permissions()->pluck('name'))->unique()->values()->all();
            $this->sod->assertPermissionSet($org, $permissions);

            $scope = strtoupper((string) ($data['data_scope'] ?? $membership->data_scope ?? 'OWN'));
            $scopeData = array_key_exists('scope_data', $data) ? $data['scope_data'] : $membership->scope_data;
            $expires = $data['expires_at'] ?? null;

            $membership->roleAssignments()->delete();
            foreach ($roles as $role) {
                $membership->roleAssignments()->create([
                    'role_id' => $role->id,
                    'scope' => $scope,
                    'scope_data' => $scopeData,
                    'expires_at' => $expires,
                    'assigned_by' => $actor->id,
                    'reason' => 'Administrative access update',
                ]);
            }

            $membership->update([
                'role' => 'assigned',
                'data_scope' => $scope,
                'scope_data' => $scopeData,
            ]);

            $target->increment('authz_version');
            $this->sessions->revokeAll($target);
        }

        if (array_key_exists('employee_id', $data)) {
            $this->unlinkEmployee($target, $org);
            if ($data['employee_id']) {
                $this->dataScope->assertEmployee($actor, $org, (int) $data['employee_id']);
                $this->linkEmployee($target, $org, (int) $data['employee_id']);
            }
        }

        return $target->load($this->relations([$org]));
    }

    public function setStatus(User $actor, User $target, string $status, ?int $organizationId = null): User
    {
        if (! in_array($status, self::USER_STATUSES, true)) {
            abort(422, 'Unsupported user status.');
        }

        $org = $organizationId ?: $this->shared($actor, $target, 'user.manage');
        $this->authz->authorize($actor, $org, 'user.manage');

        $membership = $target->memberships()->where('organization_id', $org)->firstOrFail();
        $isTargetOwner = $membership->role === 'owner' || $membership->roleAssignments()->whereHas('role', fn ($query) => $query->where('name', 'organization_owner'))->exists();
        if ($isTargetOwner && ! $this->authz->can($actor, $org, 'organization.owner.assign')) {
            abort(403, 'You do not have permission to modify or deactivate an owner.');
        }
        $this->ownerContinuity($membership, null, $status);

        $membership->update([
            'status' => $status,
            'activated_at' => $status === 'active' ? now() : $membership->activated_at,
            'suspended_at' => $status === 'suspended' ? now() : null,
        ]);

        $target->increment('authz_version');
        $this->sessions->revokeAll($target);

        return $target->load($this->relations([$org]));
    }

    public function resendInvitation(User $actor, User $target, ?int $organizationId = null): array
    {
        $org = $organizationId ?: $this->shared($actor, $target, 'user.manage');
        $this->authz->authorize($actor, $org, 'user.invite');

        $membership = $target->memberships()->where('organization_id', $org)->where('status', 'invited')->first();
        if (! $membership) {
            abort(409, 'Only invited accounts can receive an invitation again.');
        }

        $roles = $membership->roleAssignments()->with('role')->get()->pluck('role.name')->filter()->all();
        if ($roles === []) {
            abort(409, 'Invitation has no assigned roles.');
        }

        $result = $this->invitations->issue(
            $actor,
            $org,
            $target->email,
            $roles,
            $membership->data_scope,
            $membership->scope_data,
            $target->name,
        );

        return [
            'delivered' => $result['delivered'] ?? true,
            'sent_at' => now()->toIso8601String(),
        ];
    }

    public function rejectUnsafeDeletion(User $actor, User $target): never
    {
        $this->authz->authorize($actor, $this->shared($actor, $target, 'user.manage'), 'user.manage');
        abort(409, 'User accounts cannot be permanently deleted. Deactivate the account to preserve audit and history data.');
    }

    public function organizationOptions(User $actor): Collection
    {
        return Organization::query()
            ->whereIn('id', $this->authz->manageableOrganizationIds($actor, 'user.view'))
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);
    }

    public function roleOptions(User $actor, int $org): Collection
    {
        $this->authz->authorize($actor, $org, 'user.view');

        return Role::query()
            ->where(fn ($q) => $q->where('organization_id', $org)->orWhereNull('organization_id'))
            ->orderBy('name')
            ->get(['id', 'name', 'display_name', 'description']);
    }

    public function employeeOptions(User $actor, int $org): Collection
    {
        $this->authz->authorize($actor, $org, 'user.view');

        return Employee::query()
            ->where('organization_id', $org)
            ->whereNull('user_id')
            ->orderBy('first_name')
            ->get(['id', 'employee_id', 'first_name', 'last_name', 'email']);
    }

    private function resolve(User $actor, ?int $org, string $permission): int
    {
        if ($org) {
            $this->authz->authorize($actor, $org, $permission);

            return $org;
        }

        $id = $this->authz->manageableOrganizationIds($actor, $permission)[0] ?? 0;
        if (! $id) {
            throw new AuthorizationException('An explicit manageable organization is required.');
        }

        return (int) $id;
    }

    private function shared(User $actor, User $target, string $permission): int
    {
        $managed = $this->authz->manageableOrganizationIds($actor, $permission);
        $id = (int) ($target->memberships()->whereIn('organization_id', $managed)->value('organization_id') ?? 0);
        if (! $id) {
            throw new AuthorizationException('You do not have access to this user.');
        }

        return $id;
    }

    private function resolveRoles(int $org, mixed $input): Collection
    {
        $names = is_array($input) ? $input : [$input];
        $names = collect($names)
            ->filter(fn ($name) => is_string($name) && trim($name) !== '')
            ->map(fn ($name) => $this->compat(trim($name)))
            ->unique()
            ->values();

        if ($names->isEmpty()) {
            abort(422, 'At least one role is required.');
        }

        $roles = Role::query()
            ->where(fn ($q) => $q->where('organization_id', $org)->orWhereNull('organization_id'))
            ->whereIn('name', $names)
            ->get();

        if ($roles->count() !== $names->count()) {
            foreach ($names as $name) {
                if (! $roles->contains('name', $name)) {
                    $role = Role::firstOrCreate(
                        ['name' => $name, 'organization_id' => $org],
                        ['display_name' => ucwords(str_replace('_', ' ', $name)), 'is_system' => true]
                    );
                    $roles->push($role);
                }
            }
        }

        return $roles;
    }

    private function compat(string $role): string
    {
        return self::ROLE_COMPAT[$role] ?? $role;
    }

    private function assertOwnerPermission(User $actor, int $org, Collection $roles): void
    {
        if ($roles->contains(fn ($role) => $role->name === 'organization_owner')) {
            $this->authz->authorize($actor, $org, 'organization.owner.assign');
        }
    }

    private function ownerContinuity(OrganizationMember $membership, ?string $newRole, ?string $newStatus): void
    {
        $isOwner = $membership->role === 'owner' || $membership->roleAssignments()->whereHas('role', fn ($query) => $query->where('name', 'organization_owner'))->exists();
        $removing = $newRole !== null && $newRole !== 'organization_owner' && $newRole !== 'owner';
        $disabling = $newStatus !== null && $newStatus !== 'active';

        if (! $isOwner || (! $removing && ! $disabling)) {
            return;
        }

        $other = OrganizationMember::query()
            ->where('organization_id', $membership->organization_id)
            ->where('status', 'active')
            ->where('user_id', '!=', $membership->user_id)
            ->where(fn ($q) => $q->where('role', 'owner')->orWhereHas('roleAssignments.role', fn ($query) => $query->where('name', 'organization_owner')))
            ->exists();

        if (! $other) {
            abort(409, 'The organization must retain at least one active owner.');
        }
    }

    private function linkEmployee(User $user, int $org, int $employeeId): void
    {
        $employee = Employee::query()->where('organization_id', $org)->findOrFail($employeeId);
        if ($employee->user_id && (int) $employee->user_id !== (int) $user->id) {
            abort(409, 'This employee is already linked to another user.');
        }

        if (Employee::query()->where('organization_id', $org)->where('user_id', $user->id)->where('id', '!=', $employee->id)->exists()) {
            abort(409, 'This user is already linked to another employee.');
        }

        $employee->update(['user_id' => $user->id]);
    }

    private function unlinkEmployee(User $user, int $org): void
    {
        Employee::query()->where('organization_id', $org)->where('user_id', $user->id)->update(['user_id' => null]);
    }

    private function relations(array $organizationIds): array
    {
        return [
            'organizations' => fn ($query) => $query->whereIn('organizations.id', $organizationIds),
            'employees' => fn ($query) => $query->whereIn('organization_id', $organizationIds)->with(['department', 'designation']),
            'memberships.roleAssignments.role',
        ];
    }
}
