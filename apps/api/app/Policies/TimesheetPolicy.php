<?php

namespace App\Policies;

class TimesheetPolicy extends OrganizationBoundPolicy
{
    protected function permission(string $ability): string
    {
        return $ability === 'view' ? 'timesheet.view' : 'timesheet.manage';
    }
}
