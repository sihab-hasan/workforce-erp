<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Organization extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'subdomain',
        'status',
    ];

    public function members()
    {
        return $this->belongsToMany(User::class, 'organization_members')
            ->withPivot(['role', 'status'])
            ->withTimestamps();
    }

    public function memberships()
    {
        return $this->hasMany(OrganizationMember::class);
    }

    public function branches()
    {
        return $this->hasMany(Branch::class);
    }

    public function departments()
    {
        return $this->hasMany(Department::class);
    }

    public function designations()
    {
        return $this->hasMany(Designation::class);
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    public function roles()
    {
        return $this->hasMany(Role::class);
    }

    public function timesheets()
    {
        return $this->hasMany(Timesheet::class);
    }
}
