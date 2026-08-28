<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecurityAuditEvent extends Model
{
    public $timestamps = false;

    protected $guarded = [];

    protected $casts = ['before_state' => 'array', 'after_state' => 'array', 'success' => 'boolean', 'created_at' => 'datetime'];
}
