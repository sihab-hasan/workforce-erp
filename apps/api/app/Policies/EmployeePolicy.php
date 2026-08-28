<?php

namespace App\Policies;

class EmployeePolicy extends OrganizationBoundPolicy
{
    protected function permission(string $ability): string
    {
        return $ability === 'view' ? 'employee.read' : 'employee.manage';
    }
}
