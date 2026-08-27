<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
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
        'password',
        'sso_provider',
        'sso_provider_id',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
    ];

    public function organizations()
    {
        return $this->belongsToMany(Organization::class, 'organization_members')
            ->withPivot(['role', 'status'])
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
}
