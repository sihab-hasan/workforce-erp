<?php

namespace App\Policies;

use App\Models\User;
use App\Services\AuthorizationService;

abstract class OrganizationBoundPolicy
{
    public function __construct(protected readonly AuthorizationService $authz) {}

    abstract protected function permission(string $ability): string;

    protected function organizationId(object $resource): int
    {
        return (int) ($resource->organization_id ?? $resource->id ?? 0);
    }

    public function view(User $user, object $resource): bool
    {
        return $this->authz->can($user, $this->organizationId($resource), $this->permission('view'));
    }

    public function update(User $user, object $resource): bool
    {
        return $this->authz->can($user, $this->organizationId($resource), $this->permission('update'));
    }

    public function delete(User $user, object $resource): bool
    {
        return $this->authz->can($user, $this->organizationId($resource), $this->permission('delete'));
    }
}
