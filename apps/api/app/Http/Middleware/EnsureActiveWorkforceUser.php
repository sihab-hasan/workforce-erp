<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveWorkforceUser
{
    public function handle(Request $r, Closure $next): Response
    {
        $u = $r->user();
        if (! $u || $u->status !== 'active' || $u->locked_at) {
            if ($r->hasSession()) {
                auth('web')->logout();
                $r->session()->invalidate();
                $r->session()->regenerateToken();
            }
            abort(401, 'Unauthenticated.');
        }

        $hasActiveMembership = $u->memberships()->where('status', 'active')->exists();
        $hasPlatformRole = DB::table('platform_role_assignments')->where('user_id', $u->id)->exists();
        if (! $hasActiveMembership && ! $hasPlatformRole) {
            $u->tokens()->delete();
            if ($r->hasSession()) {
                auth('web')->logout();
                $r->session()->invalidate();
                $r->session()->regenerateToken();
            }
            abort(401, 'Unauthenticated.');
        }

        return $next($r);
    }
}
