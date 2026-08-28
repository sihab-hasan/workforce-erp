<?php

namespace App\Http\Middleware;

use App\Services\AuthorizationService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequirePlatformRole
{
    public function __construct(private readonly AuthorizationService $authz) {}

    public function handle(Request $r, Closure $next, string ...$roles): Response
    {
        if (! $r->user() || ! $this->authz->hasPlatformRole($r->user(), $roles)) {
            abort(403, 'Platform authorization required.');
        }

        return $next($r);
    }
}
