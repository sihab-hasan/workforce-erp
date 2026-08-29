<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrganizationInvitation extends Model
{
    protected $guarded = [];

    protected $hidden = ['token_hash'];

    protected $casts = ['role_ids' => 'array', 'scope_data' => 'array', 'expires_at' => 'datetime', 'accepted_at' => 'datetime', 'revoked_at' => 'datetime'];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function membership()
    {
        return $this->belongsTo(OrganizationMember::class, 'organization_member_id');
    }
}
