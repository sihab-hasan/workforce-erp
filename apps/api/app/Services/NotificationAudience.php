<?php

namespace App\Services;

use App\Models\OrganizationMember;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Resolves which organization members should receive a workflow notification.
 */
class NotificationAudience
{
    /**
     * Active members of the organization holding $permission, excluding one user.
     *
     * @return Collection<int, User>
     */
    public function usersWithPermission(int $organizationId, string $permission, int $excludeUserId): Collection
    {
        $permissionId = Permission::query()->where('name', $permission)->value('id');

        $userIds = OrganizationMember::query()
            ->where('organization_id', $organizationId)
            ->where('status', 'active')
            ->where('user_id', '!=', $excludeUserId)
            ->whereHas('roleAssignments.role.permissions', fn ($q) => $q->where('permissions.id', $permissionId))
            ->pluck('user_id');

        return User::query()->whereIn('id', $userIds)->get();
    }
}
