<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSsoIdentity extends Model
{
    protected $guarded = [];

    protected $casts = ['metadata' => 'array'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
