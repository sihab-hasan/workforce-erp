<?php

namespace App\Policies;

class DepartmentPolicy extends OrganizationBoundPolicy
{
    protected function permission(string $ability): string
    {
        return $ability === 'view' ? 'department.view' : 'department.manage';
    }
}
