<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'status',
        'sso_provider',
        'sso_provider_id',
        'email_verified_at',
        'phone_verified_at',
        'password_initialized_at',
        'last_login_at',
        'auth_version',
        'authz_version',
        'security_metadata',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'phone_verified_at' => 'datetime',
        'password_initialized_at' => 'datetime',
        'last_login_at' => 'datetime',
        'locked_at' => 'datetime',
        'auth_version' => 'integer',
        'authz_version' => 'integer',
        'security_metadata' => 'array',
    ];

    public function organizations()
    {
        return $this->belongsToMany(Organization::class, 'organization_members')
            ->withPivot(['role', 'status', 'data_scope', 'scope_data'])
            ->withTimestamps();
    }

    public function memberships()
    {
        return $this->hasMany(OrganizationMember::class);
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    public function workforceNotifications()
    {
        return $this->hasMany(WorkforceNotification::class);
    }

    public function authenticatorFactors()
    {
        return $this->hasMany(AuthenticatorFactor::class);
    }

    public function verificationChallenges()
    {
        return $this->hasMany(VerificationChallenge::class);
    }

    public function platformRoleAssignments()
    {
        return $this->hasMany(PlatformRoleAssignment::class);
    }

    public function ssoIdentities()
    {
        return $this->hasMany(UserSsoIdentity::class);
    }
}
