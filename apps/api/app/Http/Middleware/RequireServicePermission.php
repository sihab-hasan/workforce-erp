<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class RequireServicePermission
{
    public function handle(Request $r, Closure $next, string $permission): Response
    {
        $account = $r->attributes->get('service.account');
        if (! $account) {
            abort(401);
        }$allowed = DB::table('service_account_permissions as sap')->join('permissions as p', 'p.id', '=', 'sap.permission_id')->where('sap.service_account_id', $account->id)->where('p.name', $permission)->exists();
        if (! $allowed) {
            abort(403, 'Service account permission denied.');
        }

        return $next($r);
    }
}
