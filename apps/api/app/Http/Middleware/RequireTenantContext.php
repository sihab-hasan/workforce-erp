<?php

namespace App\Http\Middleware;

use App\Services\WorkforceScopeService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireTenantContext
{
    public function __construct(private readonly WorkforceScopeService $scope) {}

    public function handle(Request $r, Closure $next): Response
    {
        $this->scope->organization($r, true);

        return $next($r);
    }
}
