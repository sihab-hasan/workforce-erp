<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SessionSecurityService
{
    public function __construct(private readonly AuthorizationService $authorization, private readonly SecurityAuditService $audit) {}

    public function initialize(Request $request, User $user, string $method, string $client = 'erp'): void
    {
        if (! $request->hasSession()) {
            return;
        } $priv = $this->isPrivileged($user);
        $absolute = $priv ? (int) config('security.session.privileged_absolute_minutes', 480) : (int) config('security.session.standard_absolute_minutes', 1440);
        $request->session()->put(['auth_version' => (int) $user->auth_version, 'authz_version' => (int) $user->authz_version, 'authentication_method' => $method, 'mfa_level' => str_contains($method, '+') ? 'mfa' : 'single_factor', 'recent_verified_at' => str_contains($method, '+') ? now()->timestamp : null, 'absolute_expires_at' => now()->addMinutes($absolute)->timestamp, 'client' => $client, 'last_security_activity' => now()->timestamp]);
        $this->syncDatabaseMetadata($request);
    }

    public function validate(Request $request, User $user): void
    {
        if (! $request->hasSession()) {
            return;
        } $s = $request->session();
        if ((int) $s->get('auth_version', 0) !== (int) $user->auth_version || (int) $s->get('authz_version', 0) !== (int) $user->authz_version) {
            $this->invalidate($request);
            abort(401, 'Your session is no longer valid.');
        } if ((int) $s->get('absolute_expires_at', 0) <= now()->timestamp) {
            $this->invalidate($request);
            abort(401, 'Your session has expired.');
        } $idle = $this->isPrivileged($user) ? (int) config('security.session.privileged_idle_minutes', 30) : (int) config('security.session.standard_idle_minutes', 120);
        if (now()->timestamp - (int) $s->get('last_security_activity', now()->timestamp) > $idle * 60) {
            $this->invalidate($request);
            abort(401, 'Your session has expired due to inactivity.');
        } $s->put('last_security_activity', now()->timestamp);
    }

    public function markStepUp(Request $request): void
    {
        if ($request->hasSession()) {
            $request->session()->put('recent_verified_at', now()->timestamp);
            $this->syncDatabaseMetadata($request);
        }
    }

    public function requireRecentVerification(Request $request): void
    {
        if (! $request->hasSession()) {
            return;
        }
        $recent = (int) $request->session()->get('recent_verified_at', 0);
        if (! $recent || now()->timestamp - $recent > ((int) config('security.mfa.step_up_ttl_minutes', 10) * 60)) {
            throw new HttpResponseException(response()->json(['message' => 'Fresh identity verification is required.', 'code' => 'STEP_UP_REQUIRED'], 428));
        }
    }

    public function revokeAll(User $user): void
    {
        DB::table('sessions')->where('user_id', $user->id)->delete();
    }

    public function isPrivileged(User $user): bool
    {
        foreach ($user->memberships()->where('status', 'active')->pluck('organization_id') as $orgId) {
            if (array_intersect($this->authorization->roles($user, (int) $orgId), (array) config('security.mfa.privileged_roles', []))) {
                return true;
            }
        }

        return $this->authorization->hasPlatformRole($user, (array) config('security.mfa.platform_privileged_roles', []));
    }

    private function syncDatabaseMetadata(Request $r): void
    {
        if (! $r->hasSession() || config('session.driver') !== 'database') {
            return;
        } $s = $r->session();
        DB::table('sessions')->where('id', $s->getId())->update(['auth_version' => $s->get('auth_version'), 'authz_version' => $s->get('authz_version'), 'authentication_method' => $s->get('authentication_method'), 'mfa_level' => $s->get('mfa_level'), 'recent_verified_at' => $s->get('recent_verified_at') ? date('Y-m-d H:i:s', $s->get('recent_verified_at')) : null, 'absolute_expires_at' => $s->get('absolute_expires_at') ? date('Y-m-d H:i:s', $s->get('absolute_expires_at')) : null, 'client' => $s->get('client')]);
    }

    private function invalidate(Request $r): void
    {
        auth('web')->logout();
        if ($r->hasSession()) {
            $r->session()->invalidate();
            $r->session()->regenerateToken();
        }
    }
}
