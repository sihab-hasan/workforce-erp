<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

/**
 * Laravel 13 request-forgery protection with origin / Sec-Fetch-Site checks.
 *
 * The API's first-party SPA authentication relies on Sanctum cookie sessions,
 * so no authentication endpoint is excluded from CSRF protection.
 */
class VerifyCsrfToken extends Middleware
{
    /** @var array<int, string> */
    protected $except = [];
}
