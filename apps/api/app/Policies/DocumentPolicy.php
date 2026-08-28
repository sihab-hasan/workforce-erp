<?php

namespace App\Policies;

class DocumentPolicy extends OrganizationBoundPolicy
{
    protected function permission(string $ability): string
    {
        return $ability === 'view' ? 'document.view' : 'document.manage';
    }
}
