<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrganizationDomain extends Model
{
    protected $guarded = [];

    protected $hidden = ['verification_token_hash'];

    protected $casts = ['verified_at' => 'datetime', 'only_verified_domain_users' => 'boolean', 'allow_domain_access_requests' => 'boolean', 'enforce_sso_for_domain' => 'boolean'];
}
