<?php

namespace App\Policies;

class BranchPolicy extends OrganizationBoundPolicy
{
    protected function permission(string $ability): string
    {
        return $ability === 'view' ? 'company.view' : 'company.manage';
    }
}
