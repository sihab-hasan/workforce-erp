<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuthenticatorFactor extends Model
{
    protected $guarded = [];

    protected $hidden = ['secret'];

    protected $casts = ['secret' => 'encrypted', 'confirmed_at' => 'datetime', 'last_used_at' => 'datetime'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
