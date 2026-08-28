<?php

namespace App\Http\Middleware;

use App\Services\SessionSecurityService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnforceSecureSession
{
    public function __construct(private readonly SessionSecurityService $sessions) {}

    public function handle(Request $r, Closure $next): Response
    {
        if ($r->user()) {
            $this->sessions->validate($r, $r->user());
        }

        return $next($r);
    }
}
