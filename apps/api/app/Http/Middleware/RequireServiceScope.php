<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class RequireServiceScope
{
    public function handle(Request $request, Closure $next, string ...$allowedScopes): Response
    {
        $account = $request->attributes->get('service.account');
        if (! $account) {
            abort(401, 'Service account authentication is required.');
        }

        $allowed = array_values(array_unique(array_map(
            static fn (string $scope): string => strtoupper(trim($scope)),
            $allowedScopes,
        )));
        if ($allowed === []) {
            abort(500, 'Service scope policy is not configured.');
        }

        $hasScope = DB::table('service_account_scopes')
            ->where('service_account_id', $account->id)
            ->whereIn('scope', $allowed)
            ->exists();

        if (! $hasScope) {
            abort(403, 'Service account scope denied.');
        }

        return $next($request);
    }
}
