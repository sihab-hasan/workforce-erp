<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id', 'name', 'code', 'annual_allowance', 'is_paid', 'is_active',
    ];

    protected $casts = [
        'annual_allowance' => 'decimal:2',
        'is_paid' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function requests()
    {
        return $this->hasMany(LeaveRequest::class);
    }
}
