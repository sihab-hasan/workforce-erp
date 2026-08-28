<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VerificationChallenge extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected $casts = ['available_methods' => 'array', 'risk_metadata' => 'array', 'metadata' => 'array', 'expires_at' => 'datetime', 'resend_available_at' => 'datetime', 'consumed_at' => 'datetime'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
