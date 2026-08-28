<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformRoleAssignment extends Model
{
    protected $guarded = [];

    protected $casts = ['starts_at' => 'datetime', 'expires_at' => 'datetime'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
