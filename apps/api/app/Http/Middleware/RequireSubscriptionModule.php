<?php

namespace App\Http\Middleware;

use App\Services\SubscriptionAccessService;
use App\Services\WorkforceScopeService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireSubscriptionModule
{
    public function __construct(private readonly WorkforceScopeService $scope, private readonly SubscriptionAccessService $subscription) {}

    public function handle(Request $r, Closure $next, string $module): Response
    {
        $org = $this->scope->organization($r, true);
        $this->subscription->assertModule($org, $module);

        return $next($r);
    }
}
