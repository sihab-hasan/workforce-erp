<?php

namespace App\Http\Middleware;

use App\Services\WorkforceScopeService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveWorkforceScope
{
    public function __construct(private readonly WorkforceScopeService $scope) {}

    public function handle(Request $request, Closure $next): Response
    {
        // Scope is optional at middleware level because tenant-selection/profile routes are authenticated
        // but intentionally unscoped. Domain controllers request the scope they require.
        if ($request->hasHeader('X-Tenant-Key')) {
            $this->scope->organization($request, true);
        }
        if ($request->hasHeader('X-Company-Key')) {
            $this->scope->branch($request, true);
        }

        return $next($request);
    }
}
