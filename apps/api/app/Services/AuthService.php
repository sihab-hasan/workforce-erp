<?php

namespace App\Services;

use App\Models\User;
use App\Models\VerificationChallenge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    private const DUMMY_PASSWORD_HASH = '$argon2id$v=19$m=65536,t=4,p=1$V29ya2ZvcmNlRVJQU2VjdXJpdHk$AHJH9FC1xltsvC8cX9+YLG8dEWyOZzUQjQ5O/cZwOsw';

    public function __construct(
        private readonly AuthorizationService $authorization,
        private readonly SessionSecurityService $sessions,
        private readonly VerificationChallengeService $challenges,
        private readonly SecurityAuditService $audit,
        private readonly RiskService $risk,
    ) {}

    public function authenticatePassword(array $credentials): User
    {
        $email = strtolower(trim((string) $credentials['email']));
        $user = User::query()->where('email', $email)->first();
        $ok = Hash::check((string) $credentials['password'], $user?->password ?? self::DUMMY_PASSWORD_HASH);

        if (! $user || ! $ok) {
            $this->audit->record('login.failed', $user, [
                'subject_user_id' => $user?->id,
                'success' => false,
                'failure_reason' => 'invalid_credentials',
            ]);
            abort(401, 'Invalid email or password.');
        }

        $this->assertActiveSignInAllowed($user);

        return $user;
    }

    public function beginBrowserAuthentication(Request $request, User $user, string $primaryMethod): array
    {
        $client = $this->normalizeClient((string) $request->input('client', 'erp'));
        $this->assertClientAllowed($user, $client);

        $methods = $this->challenges->availableMethods($user);
        $requiresVerification = $this->requiresMfa($user) || $this->risk->requiresVerification($user, $request);

        if ($requiresVerification) {
            if ($methods === []) {
                abort(428, 'Verification setup is required before this account can sign in.');
            }

            $challenge = $this->challenges->create(
                $user,
                'login',
                $primaryMethod,
                $client,
                $methods,
                ['risk' => $this->risk->signals($user, $request)],
            );

            return [
                'success' => true,
                'status' => 'verification_required',
                'challenge' => $this->challengePayload($challenge),
            ];
        }

        return [
            'success' => true,
            'status' => 'authenticated',
            'user' => $this->establishBrowserSession($request, $user, $primaryMethod, $client),
        ];
    }

    public function establishBrowserSession(
        Request $request,
        User $user,
        string $authenticationMethod = 'password',
        ?string $client = null,
    ): array {
        $client = $this->normalizeClient($client ?? (string) $request->input('client', 'erp'));
        $this->assertActiveSignInAllowed($user);
        $this->assertClientAllowed($user, $client);

        Auth::guard('web')->login($user);
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        $user->forceFill(['last_login_at' => now()])->save();
        $this->risk->recordSuccessfulAuthentication($user, $request);
        $this->sessions->initialize($request, $user, $authenticationMethod, $client);
        $this->audit->record('login.success', $user, [
            'subject_user_id' => $user->id,
            'authentication_method' => $authenticationMethod,
        ]);

        return $this->userPayload($user);
    }

    public function finalizeLoginChallenge(Request $request, string $challengeId, string $code): array
    {
        $challenge = $this->challengeForPurpose($challengeId, 'login');
        $verified = $this->challenges->verify($challenge, 'login', $code);

        return $this->establishBrowserSession(
            $request,
            $verified['user'],
            $verified['authentication_method'],
            (string) $challenge->client,
        );
    }

    public function challengeForPurpose(string $id, string $purpose): VerificationChallenge
    {
        $challenge = VerificationChallenge::query()->with('user')->find($id);
        if (! $challenge || ! hash_equals((string) $challenge->purpose, $purpose)) {
            abort(400, 'Invalid or expired verification challenge.');
        }

        return $challenge;
    }

    public function challengePayload(VerificationChallenge $challenge): array
    {
        return [
            'id' => (string) $challenge->id,
            'purpose' => $challenge->purpose,
            'available_methods' => $challenge->available_methods,
            'selected_method' => $challenge->selected_method,
            'expires_at' => $challenge->expires_at?->toIso8601String(),
            'resend_available_at' => $challenge->resend_available_at?->toIso8601String(),
            'client' => $challenge->client,
        ];
    }

    public function requiresMfa(User $user): bool
    {
        if ((bool) config('security.mfa.default_required', false)) {
            return true;
        }

        foreach ($user->memberships()->where('status', 'active')->pluck('organization_id') as $organizationId) {
            if (array_intersect(
                $this->authorization->roles($user, (int) $organizationId),
                (array) config('security.mfa.privileged_roles', []),
            )) {
                return true;
            }
        }

        return $this->authorization->hasPlatformRole(
            $user,
            (array) config('security.mfa.platform_privileged_roles', []),
        );
    }

    public function assertActiveSignInAllowed(User $user): void
    {
        if ($user->status !== 'active' || $user->locked_at) {
            abort(403, 'This account is not available for sign-in.');
        }

        $hasActiveMembership = $user->memberships()->where('status', 'active')->exists();
        $hasPendingMembership = $user->memberships()->where('status', 'invited')->exists();
        $hasPlatformRole = $this->authorization->platformRoles($user) !== [];

        if (! $hasActiveMembership && ! $hasPendingMembership && ! $hasPlatformRole) {
            abort(403, 'Your account does not have active Workforce access. Contact an administrator.');
        }

        if (! $hasActiveMembership && $hasPendingMembership && ! $hasPlatformRole) {
            abort(403, 'Your invitation is not active yet. Use the one-time-code sign-in flow to activate it.');
        }
    }

    public function isBlockedFromSignIn(User $user, bool $allowPending = false): bool
    {
        if ($user->status !== 'active' || $user->locked_at) {
            return true;
        }

        $statuses = $allowPending ? ['active', 'invited'] : ['active'];
        $hasMembership = $user->memberships()->whereIn('status', $statuses)->exists();
        $hasPlatformRole = $this->authorization->platformRoles($user) !== [];

        return ! $hasMembership && ! $hasPlatformRole;
    }

    public function activateInvitations(User $user): void
    {
        $user->memberships()->where('status', 'invited')->update([
            'status' => 'active',
            'activated_at' => now(),
        ]);
    }

    public function assertClientAllowed(User $user, string $client): void
    {
        if ($client === 'admin') {
            if ($this->authorization->platformRoles($user) === []) {
                $this->audit->record('login.failed', $user, [
                    'subject_user_id' => $user->id,
                    'success' => false,
                    'failure_reason' => 'platform_client_not_allowed',
                ]);
                abort(403, 'This account is not authorized for the platform administration application.');
            }

            return;
        }

        if ($client === 'erp') {
            $hasMembership = $user->memberships()
                ->whereIn('status', ['active', 'invited'])
                ->exists();

            if (! $hasMembership) {
                abort(403, 'This account is not authorized for the customer ERP application.');
            }
        }
    }

    public function userPayload(User $user, ?int $organizationId = null): array
    {
        $roleOrder = ['owner' => 1, 'organization_owner' => 1, 'admin' => 2, 'organization_admin' => 2, 'manager' => 3, 'staff' => 4, 'employee' => 4, 'readonly' => 5, 'auditor' => 5];
        $membership = $organizationId
            ? $this->authorization->activeMembership($user, $organizationId)
            : $user->memberships()->where('status', 'active')->with('organization')->get()->sortBy(fn ($m) => $roleOrder[$m->role] ?? 99)->first();
        $resolvedOrgId = $membership ? (int) $membership->organization_id : null;
        $roles = $resolvedOrgId ? $this->authorization->roles($user, $resolvedOrgId) : [];

        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'email_verified' => (bool) $user->email_verified_at,
            'phone_verified' => (bool) $user->phone_verified_at,
            'organization_id' => $membership ? (string) $membership->organization_id : null,
            'organization_name' => $membership?->organization?->name,
            // Compatibility display only. This value is not an authorization source.
            'role' => $roles[0] ?? ($membership->role ?? null),
            'roles' => $roles,
            'permissions' => $resolvedOrgId ? $this->authorization->permissions($user, $resolvedOrgId) : [],
            'scopes' => $resolvedOrgId ? $this->authorization->scopes($user, $resolvedOrgId) : [],
            'platform_roles' => $this->authorization->platformRoles($user),
            'connected_sso' => $user->ssoIdentities()->orderBy('provider')->get(['provider', 'email'])->map(fn ($identity) => ['provider' => $identity->provider, 'email' => $identity->email])->values()->all(),
        ];
    }

    public function context(Request $request): array
    {
        $user = $request->user();
        $organization = $request->attributes->get('workforce.organization');
        $organizationId = $organization?->id ? (int) $organization->id : null;
        $membership = $organizationId
            ? $this->authorization->activeMembership($user, $organizationId)
            : null;

        return [
            'user' => $this->userPayload($user, $organizationId),
            'tenant' => $organizationId ? [
                'id' => (string) $organizationId,
                'slug' => $organization->slug,
                'name' => $organization->name,
                'status' => $organization->status,
                'subscription_status' => $organization->subscription_status ?? null,
                'plan' => $organization->plan ?? null,
            ] : null,
            'membership' => $membership ? [
                'id' => (string) $membership->id,
                'status' => $membership->status,
                'data_scope' => $membership->data_scope,
            ] : null,
            'roles' => $organizationId ? $this->authorization->roles($user, $organizationId) : [],
            'permissions' => $organizationId ? $this->authorization->permissions($user, $organizationId) : [],
            'scopes' => $organizationId ? $this->authorization->scopes($user, $organizationId) : [],
            'verification' => [
                'email' => (bool) $user->email_verified_at,
                'phone' => (bool) $user->phone_verified_at,
                'authenticator' => $user->authenticatorFactors()->whereNotNull('confirmed_at')->exists(),
                'required' => $this->requiresMfa($user),
            ],
            'session' => $request->hasSession() ? [
                'authentication_method' => $request->session()->get('authentication_method'),
                'mfa_level' => $request->session()->get('mfa_level'),
                'recent_verified_at' => $this->sessionTimestamp($request->session()->get('recent_verified_at')),
                'absolute_expires_at' => $this->sessionTimestamp($request->session()->get('absolute_expires_at')),
                'client' => $request->session()->get('client'),
            ] : null,
        ];
    }

    public function browserSessions(Request $request, User $user): array
    {
        if (config('session.driver') !== 'database') {
            return [];
        }

        $current = $request->hasSession() ? $request->session()->getId() : '';

        return DB::table('sessions')
            ->where('user_id', $user->id)
            ->orderByDesc('last_activity')
            ->get()
            ->map(fn ($session) => [
                'id' => (string) $session->id,
                'name' => $this->browserName((string) ($session->user_agent ?? '')),
                'ip_address' => $session->ip_address,
                'user_agent' => $session->user_agent,
                'last_used_at' => isset($session->last_activity)
                    ? date(DATE_ATOM, (int) $session->last_activity)
                    : null,
                'expires_at' => $session->absolute_expires_at ?? null,
                'authentication_method' => $session->authentication_method ?? null,
                'current' => hash_equals((string) $session->id, $current),
                'kind' => 'browser',
            ])
            ->values()
            ->all();
    }

    public function revokeBrowserSession(User $user, string $id): bool
    {
        return DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', $id)
            ->delete() > 0;
    }

    public function revokeAllBrowserSessions(User $user): void
    {
        DB::table('sessions')->where('user_id', $user->id)->delete();
    }

    public function logoutBrowserSession(Request $request): void
    {
        $actor = $request->user();
        $sessionId = $request->hasSession() ? $request->session()->getId() : null;

        Auth::guard('web')->logout();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        $this->audit->record('logout', $actor, ['session_id' => $sessionId]);
    }

    public function normalizeClient(string $client): string
    {
        return match (strtolower(trim($client))) {
            'admin' => 'admin',
            'portal', 'web', 'erp', '' => 'erp',
            default => abort(422, 'Unsupported authentication client.'),
        };
    }

    private function browserName(string $userAgent): string
    {
        $browser = str_contains($userAgent, 'Edg/') ? 'Edge'
            : (str_contains($userAgent, 'Chrome/') ? 'Chrome'
                : (str_contains($userAgent, 'Firefox/') ? 'Firefox'
                    : (str_contains($userAgent, 'Safari/') ? 'Safari' : 'Browser')));
        $platform = str_contains($userAgent, 'Windows') ? 'Windows'
            : (str_contains($userAgent, 'Macintosh') ? 'macOS'
                : (str_contains($userAgent, 'Android') ? 'Android'
                    : (str_contains($userAgent, 'iPhone') ? 'iPhone' : 'Device')));

        return $browser.' on '.$platform;
    }

    private function sessionTimestamp(mixed $timestamp): ?string
    {
        if (! is_numeric($timestamp) || (int) $timestamp <= 0) {
            return null;
        }

        return date(DATE_ATOM, (int) $timestamp);
    }
}
