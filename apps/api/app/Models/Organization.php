<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Organization extends Model
{
    use HasFactory, SoftDeletes;

    protected $casts = [
        'settings' => 'array',
        'onboarding_data' => 'array',
        'trial_started_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'subscription_started_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
        'grace_period_ends_at' => 'datetime',
    ];

    protected $fillable = [
        'name',
        'legal_name',
        'slug',
        'subdomain',
        'email',
        'phone',
        'address',
        'timezone',
        'locale',
        'settings',
        'country',
        'currency',
        'fiscal_year_start_month',
        'plan',
        'trial_started_at',
        'trial_ends_at',
        'subscription_status',
        'subscription_started_at',
        'subscription_ends_at',
        'grace_period_ends_at',
        'onboarding_status',
        'onboarding_step',
        'onboarding_data',
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

    public function leaveTypes()
    {
        return $this->hasMany(LeaveType::class);
    }

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }
}
