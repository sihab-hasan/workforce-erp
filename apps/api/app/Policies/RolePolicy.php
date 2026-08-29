<?php

namespace App\Policies;

class RolePolicy extends OrganizationBoundPolicy
{
    protected function permission(string $ability): string
    {
        return $ability === 'view' ? 'role.view' : 'role.manage';
    }
}
