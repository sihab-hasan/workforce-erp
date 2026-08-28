<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrationChallenge extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    protected $casts = ['terms_accepted' => 'boolean', 'expires_at' => 'datetime', 'resend_available_at' => 'datetime', 'consumed_at' => 'datetime'];
}
