<?php

namespace App\Services;

use App\Models\OrganizationMember;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class AuthorizationService
{
    public const SCOPES = ['OWN', 'DIRECT_REPORTS', 'TEAM', 'DEPARTMENT', 'BRANCH', 'COMPANY', 'BUSINESS_UNIT', 'ORGANIZATION', 'GLOBAL'];

    public function __construct(private readonly BreakGlassService $breakGlass) {}

    private const ALL_PERMISSIONS = [
        'user.view', 'user.invite', 'user.manage', 'user.create', 'user.update', 'user.delete',
        'role.view', 'role.manage', 'role.assign',
        'employee.view', 'employee.create', 'employee.update', 'employee.delete', 'employee.manage',
        'department.view', 'department.manage',
        'designation.view', 'designation.manage',
        'branch.view', 'branch.manage',
        'timesheet.view', 'timesheet.create', 'timesheet.update', 'timesheet.approve', 'timesheet.manage', 'timesheet.clock',
        'leave.view', 'leave.create', 'leave.update', 'leave.approve', 'leave.manage',
        'document.view', 'document.upload', 'document.delete', 'document.manage',
        'report.view', 'report.export', 'report.manage',
        'security.manage', 'security.view', 'session.manage', 'audit.view',
        'organization.view', 'organization.manage', 'organization.owner.assign',
    ];

    private const MANAGER_PERMISSIONS = [
        'user.view', 'user.invite',
        'employee.view', 'employee.create', 'employee.update',
        'department.view', 'designation.view', 'branch.view',
        'timesheet.view', 'timesheet.create', 'timesheet.update', 'timesheet.approve', 'timesheet.clock',
        'leave.view', 'leave.create', 'leave.update', 'leave.approve',
        'document.view', 'document.upload',
        'report.view', 'report.export',
    ];

    private const STAFF_PERMISSIONS = [
        'employee.view',
        'timesheet.view', 'timesheet.create', 'timesheet.clock',
        'leave.view', 'leave.create',
        'document.view',
    ];

    public function permissions(User $user, int $organizationId): array
    {
        $membership = $this->activeMembership($user, $organizationId);
        if (! $membership) {
            return [];
        }

        $assigned = DB::table('membership_role_assignments as mra')->join('roles as r', 'r.id', '=', 'mra.role_id')->join('role_permissions as rp', 'rp.role_id', '=', 'r.id')->join('permissions as p', 'p.id', '=', 'rp.permission_id')
            ->where('mra.organization_member_id', $membership->id)->where(fn ($q) => $q->whereNull('mra.starts_at')->orWhere('mra.starts_at', '<=', now()))->where(fn ($q) => $q->whereNull('mra.expires_at')->orWhere('mra.expires_at', '>', now()))
            ->distinct()->orderBy('p.name')->pluck('p.name')->all();

        if (! empty($assigned)) {
            return $assigned;
        }

        $roleName = strtolower((string) $membership->role);
        if ($roleName === 'owner') {
            return self::ALL_PERMISSIONS;
        }
        if ($roleName === 'admin') {
            return array_values(array_diff(self::ALL_PERMISSIONS, ['organization.owner.assign']));
        }
        if ($roleName === 'manager') {
            return self::MANAGER_PERMISSIONS;
        }
        if ($roleName === 'staff') {
            return self::STAFF_PERMISSIONS;
        }
        if ($roleName === 'readonly') {
            return ['user.view', 'employee.view', 'timesheet.view', 'leave.view', 'document.view', 'report.view'];
        }

        return DB::table('roles as r')
            ->join('role_permissions as rp', 'rp.role_id', '=', 'r.id')
            ->join('permissions as p', 'p.id', '=', 'rp.permission_id')
            ->where('r.name', $roleName)
            ->where(fn ($q) => $q->where('r.organization_id', $organizationId)->orWhereNull('r.organization_id'))
            ->distinct()
            ->orderBy('p.name')
            ->pluck('p.name')
            ->all();
    }

    public function roles(User $user, int $organizationId): array
    {
        $membership = $this->activeMembership($user, $organizationId);
        if (! $membership) {
            return [];
        }

        $assigned = DB::table('membership_role_assignments as mra')->join('roles as r', 'r.id', '=', 'mra.role_id')->where('mra.organization_member_id', $membership->id)
            ->where(fn ($q) => $q->whereNull('mra.starts_at')->orWhere('mra.starts_at', '<=', now()))->where(fn ($q) => $q->whereNull('mra.expires_at')->orWhere('mra.expires_at', '>', now()))->orderBy('r.name')->pluck('r.name')->all();

        if (! empty($assigned)) {
            return $assigned;
        }

        return $membership->role ? [$membership->role] : [];
    }

    public function scopes(User $user, int $organizationId): array
    {
        $membership = $this->activeMembership($user, $organizationId);
        if (! $membership) {
            return [];
        }
        $rows = DB::table('membership_role_assignments')->where('organization_member_id', $membership->id)->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))->get(['scope', 'scope_data']);
        if ($rows->isEmpty()) {
            return [['scope' => $membership->data_scope, 'data' => $membership->scope_data]];
        }

        return $rows->map(fn ($r) => ['scope' => $r->scope, 'data' => $r->scope_data ? json_decode($r->scope_data, true) : null])->values()->all();
    }

    public function baseCan(User $user, int $organizationId, string $permission): bool
    {
        $permissions = $this->permissions($user, $organizationId);
        if (in_array($permission, $permissions, true)) {
            return true;
        }

        if (str_ends_with($permission, '.read')) {
            $viewPerm = substr($permission, 0, -5).'.view';
            if (in_array($viewPerm, $permissions, true)) {
                return true;
            }
        }
        if (str_ends_with($permission, '.view')) {
            $readPerm = substr($permission, 0, -5).'.read';
            if (in_array($readPerm, $permissions, true)) {
                return true;
            }
        }

        return false;
    }

    public function can(User $user, int $organizationId, string $permission): bool
    {
        return $this->baseCan($user, $organizationId, $permission) || ($this->activeMembership($user, $organizationId) && $this->breakGlass->allowsTenant($user, $organizationId, $permission));
    }

    public function authorize(User $user, int $organizationId, string $permission, string $message = 'You do not have permission to perform this action.'): void
    {
        if ($this->baseCan($user, $organizationId, $permission)) {
            return;
        }
        if ($this->activeMembership($user, $organizationId) && $this->breakGlass->allowsTenant($user, $organizationId, $permission)) {
            $this->breakGlass->auditUse($user, $organizationId, $permission);

            return;
        }
        throw new AuthorizationException($message);
    }

    public function activeMembership(User $user, int $organizationId): ?OrganizationMember
    {
        return OrganizationMember::query()->where('user_id', $user->id)->where('organization_id', $organizationId)->where('status', 'active')->first();
    }

    public function manageableOrganizationIds(User $user, string $permission): array
    {
        $ids = $user->memberships()->where('status', 'active')->pluck('organization_id')->all();

        return array_values(array_filter($ids, fn ($id) => $this->can($user, (int) $id, $permission)));
    }

    public function platformRoles(User $user): array
    {
        return DB::table('platform_role_assignments')->where('user_id', $user->id)->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))->pluck('role')->all();
    }

    public function hasPlatformRole(User $user, array $roles): bool
    {
        return array_intersect($roles, $this->platformRoles($user)) !== [];
    }

    public function platformPermissions(User $user): array
    {
        $catalog = (array) config('security.platform.role_permissions', []);
        $permissions = [];
        foreach ($this->platformRoles($user) as $role) {
            $permissions = array_merge($permissions, (array) ($catalog[$role] ?? []));
        }$permissions = array_values(array_unique($permissions));
        sort($permissions);

        return $permissions;
    }

    public function baseCanPlatform(User $user, string $permission): bool
    {
        return in_array($permission, $this->platformPermissions($user), true);
    }

    public function canPlatform(User $user, string $permission): bool
    {
        return $this->baseCanPlatform($user, $permission) || $this->breakGlass->allowsPlatform($user, $permission);
    }

    public function authorizePlatform(User $user, string $permission, string $message = 'Platform permission denied.'): void
    {
        if ($this->baseCanPlatform($user, $permission)) {
            return;
        }if ($this->breakGlass->allowsPlatform($user, $permission)) {
            $this->breakGlass->auditUse($user, null, $permission);

            return;
        }throw new AuthorizationException($message);
    }
}
