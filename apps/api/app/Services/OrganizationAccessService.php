<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;

class OrganizationAccessService
{
    public const USER_MANAGER_ROLES = ['owner', 'admin'];

    public const TIMESHEET_MANAGER_ROLES = ['owner', 'admin', 'manager'];

    /**
     * Return active organization IDs for a user, optionally constrained by membership roles.
     *
     * @param  array<int, string>|null  $roles
     * @return array<int, int>
     */
    public function organizationIds(User $user, ?array $roles = null): array
    {
        $query = $user->memberships()->where('status', 'active');

        if ($roles !== null) {
            $query->whereIn('role', $roles);
        }

        return $query->pluck('organization_id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    /**
     * @param  array<int, string>  $roles
     */
    public function assertCanManageAny(
        User $user,
        array $roles,
        string $message = 'You do not have permission to access this area.'
    ): void {
        if ($this->organizationIds($user, $roles) === []) {
            throw new AuthorizationException($message);
        }
    }

    /**
     * @param  array<int, string>  $roles
     */
    public function assertCanManage(
        User $user,
        int $organizationId,
        array $roles,
        string $message = 'You do not have permission to manage this organization.'
    ): void {
        $hasAccess = $user->memberships()
            ->where('organization_id', $organizationId)
            ->where('status', 'active')
            ->whereIn('role', $roles)
            ->exists();

        if (! $hasAccess) {
            throw new AuthorizationException($message);
        }
    }


    public function activeRole(User $user, int $organizationId): ?string
    {
        return $user->memberships()
            ->where('organization_id', $organizationId)
            ->where('status', 'active')
            ->value('role');
    }

    /**
     * Find the first organization shared by a managing actor and a target user.
     *
     * @param  array<int, string>  $managerRoles
     */
    public function firstSharedOrganizationId(User $actor, User $target, array $managerRoles): int
    {
        $organizationIds = $this->organizationIds($actor, $managerRoles);

        if ($organizationIds === []) {
            return 0;
        }

        return (int) ($target->organizations()
            ->whereIn('organizations.id', $organizationIds)
            ->value('organizations.id') ?? 0);
    }

    /**
     * Return employee IDs linked to the authenticated user in accessible organizations.
     *
     * @param  array<int, int>  $organizationIds
     * @return array<int, int>
     */
    public function ownEmployeeIds(User $user, array $organizationIds): array
    {
        if ($organizationIds === []) {
            return [];
        }

        return Employee::query()
            ->whereIn('organization_id', $organizationIds)
            ->where('user_id', $user->id)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }
}
