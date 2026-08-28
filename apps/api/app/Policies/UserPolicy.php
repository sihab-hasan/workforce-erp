<?php

namespace App\Policies;

use App\Models\User;
use App\Services\AuthorizationService;

class UserPolicy
{
    public function __construct(private readonly AuthorizationService $authz) {}

    public function view(User $actor, User $subject): bool
    {
        foreach ($actor->memberships()->where('status', 'active')->pluck('organization_id') as $id) {
            if ($this->authz->can($actor, (int) $id, 'user.view') && $subject->memberships()->where('organization_id', $id)->exists()) {
                return true;
            }
        }

        return false;
    }

    public function update(User $actor, User $subject): bool
    {
        foreach ($actor->memberships()->where('status', 'active')->pluck('organization_id') as $id) {
            if ($this->authz->can($actor, (int) $id, 'user.manage') && $subject->memberships()->where('organization_id', $id)->exists()) {
                return true;
            }
        }

        return false;
    }
}
