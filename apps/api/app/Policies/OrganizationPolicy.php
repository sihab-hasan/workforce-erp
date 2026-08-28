<?php

namespace App\Policies;

class OrganizationPolicy extends OrganizationBoundPolicy
{
    protected function permission(string $ability): string
    {
        return $ability === 'view' ? 'organization.view' : 'organization.manage';
    }
}
