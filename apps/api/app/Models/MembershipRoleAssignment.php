<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MembershipRoleAssignment extends Model
{
    protected $guarded = [];

    protected $casts = ['scope_data' => 'array', 'starts_at' => 'datetime', 'expires_at' => 'datetime'];

    public function membership()
    {
        return $this->belongsTo(OrganizationMember::class, 'organization_member_id');
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }
}
