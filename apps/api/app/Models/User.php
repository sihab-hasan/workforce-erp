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
        'id',
        'name',
        'email',
        'password',
        'sso_provider',
        'sso_provider_id',
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

    public function posts()
    {
        return $this->hasMany(Post::class); // One user has many posts
    }

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
}
