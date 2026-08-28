<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;

class OrganizationAccessService
{
    public function __construct(private readonly AuthorizationService $authorization) {}

    public function organizationIds(User $u, array|string $permission = 'user.manage'): array
    {
        $p = is_array($permission) ? 'user.manage' : $permission;

        return $this->authorization->manageableOrganizationIds($u, $p);
    }

    public function activeRole(User $u, int $org): ?string
    {
        return $this->authorization->roles($u, $org)[0] ?? null;
    }

    public function assertCanManage(User $u, int $org, array|string $permission = 'user.manage', string $message = 'You do not have permission to manage this organization.'): void
    {
        $this->authorization->authorize($u, $org, is_array($permission) ? 'user.manage' : $permission, $message);
    }

    public function assertCanManageAny(User $u, array|string $permission = 'user.manage', string $message = 'You do not have permission to access this area.'): void
    {
        if ($this->organizationIds($u, $permission) === []) {
            throw new AuthorizationException($message);
        }
    }

    public function firstSharedOrganizationId(User $actor, User $target, array|string $permission = 'user.manage'): int
    {
        $managed = $this->organizationIds($actor, $permission);

        return (int) ($target->memberships()->where('status', 'active')->whereIn('organization_id', $managed)->value('organization_id') ?? 0);
    }
}
