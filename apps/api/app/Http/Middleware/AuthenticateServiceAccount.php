<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateServiceAccount
{
    public function handle(Request $r, Closure $next): Response
    {
        $raw = $r->bearerToken();
        if (! $raw) {
            abort(401, 'Service bearer token required.');
        }$hash = hash('sha256', $raw);
        $token = DB::table('service_access_tokens')->where('token_hash', $hash)->whereNull('revoked_at')->where('expires_at', '>', now())->first();
        if (! $token) {
            abort(401, 'Invalid or expired service token.');
        }if (! in_array((string) $token->audience, (array) config('security.service_accounts.audiences', ['workforce-api']), true)) {
            abort(401, 'Invalid service token audience.');
        }$account = DB::table('service_accounts')->where('id', $token->service_account_id)->where('status', 'active')->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))->first();
        if (! $account) {
            abort(401, 'Service account is not active.');
        }DB::transaction(function () use ($r, $token, $account) {
            DB::table('service_access_tokens')->where('id', $token->id)->update(['last_used_at' => now(), 'last_ip' => $r->ip(), 'updated_at' => now()]);
            DB::table('service_accounts')->where('id', $account->id)->update(['last_used_at' => now(), 'last_ip' => $r->ip(), 'updated_at' => now()]);
        });
        $r->attributes->set('service.account', $account);
        $r->attributes->set('service.token', $token);

        return $next($r);
    }
}
