<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrganizationMember extends Model
{
    use HasFactory;

    protected $fillable = ['organization_id', 'user_id', 'role', 'status', 'data_scope', 'scope_data', 'activated_at', 'suspended_at'];

    protected $casts = ['scope_data' => 'array', 'activated_at' => 'datetime', 'suspended_at' => 'datetime'];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function roleAssignments()
    {
        return $this->hasMany(MembershipRoleAssignment::class);
    }
}
