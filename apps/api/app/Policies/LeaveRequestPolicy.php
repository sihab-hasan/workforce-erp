<?php

namespace App\Policies;

use App\Models\LeaveRequest;
use App\Models\User;

class LeaveRequestPolicy extends OrganizationBoundPolicy
{
    protected function permission(string $ability): string
    {
        return $ability === 'view' ? 'leave.view' : 'leave.manage';
    }

    public function approve(User $u, LeaveRequest $r): bool
    {
        return $this->authz->can($u, (int) $r->organization_id, 'leave.approve');
    }
}
