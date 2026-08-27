<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class AuthService
{
    private const DUMMY_PASSWORD_HASH = '$2y$12$Au4MEQHprYE/aBgtPgqHPufrlr/pkk.CwQqHsrfDKDJRv2AldqJQC';

    public function authenticatePassword(array $credentials): User
    {
        $user = User::query()->where('email', $credentials['email'])->first();
        $passwordMatches = Hash::check(
            $credentials['password'],
            $user?->password ?? self::DUMMY_PASSWORD_HASH
        );

        if (! $user || ! $passwordMatches) {
            abort(401, 'Invalid email or password.');
        }

        if ($this->isBlockedFromSignIn($user)) {
            $message = $user->memberships()->where('status', 'invited')->exists()
                ? 'Your invitation is not active yet. Use the one-time-code sign-in flow to activate it.'
                : 'Your account does not have active Workforce access. Contact an administrator.';
            abort(403, $message);
        }

        return $user;
    }

    /** Establish a first-party browser session without exposing a token to JavaScript. */
    public function establishBrowserSession(Request $request, User $user): array
    {
        $this->assertActiveSignInAllowed($user);
        Auth::guard('web')->login($user);
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }
        $user->forceFill(['last_login_at' => now()])->save();

        return $this->userPayload($user);
    }

    /** Personal access tokens remain available for non-browser API clients only. */
    public function issueApiToken(User $user, string $tokenName = 'api'): array
    {
        $this->assertActiveSignInAllowed($user);
        $expirationMinutes = config('sanctum.expiration');
        $expiresAt = is_numeric($expirationMinutes) && (int) $expirationMinutes > 0
            ? now()->addMinutes((int) $expirationMinutes)
            : null;

        return [
            'token' => $user->createToken($tokenName, ['*'], $expiresAt)->plainTextToken,
            'user' => $this->userPayload($user),
        ];
    }

    public function usesPersonalAccessToken(User $user): bool
    {
        return $user->currentAccessToken() instanceof PersonalAccessToken;
    }

    public function activateInvitations(User $user): void
    {
        $user->memberships()->where('status', 'invited')->update(['status' => 'active']);
    }

    public function isBlockedFromSignIn(User $user, bool $allowInvited = false): bool
    {
        if (! $user->memberships()->exists()) {
            return true;
        }
        $allowedStatuses = $allowInvited ? ['active', 'invited'] : ['active'];

        return ! $user->memberships()->whereIn('status', $allowedStatuses)->exists();
    }

    public function assertActiveSignInAllowed(User $user): void
    {
        if ($this->isBlockedFromSignIn($user)) {
            abort(403, 'Your account does not have active Workforce access. Contact an administrator.');
        }
    }

    public function logoutBrowserSession(Request $request): void
    {
        Auth::guard('web')->logout();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
    }

    public function revokeAllBrowserSessions(User $user): void
    {
        if (config('session.driver') === 'database') {
            DB::table(config('session.table', 'sessions'))->where('user_id', $user->getAuthIdentifier())->delete();
        }
    }

    public function revokeBrowserSession(User $user, string $sessionId): bool
    {
        if (config('session.driver') !== 'database') {
            return false;
        }

        return DB::table(config('session.table', 'sessions'))
            ->where('id', $sessionId)
            ->where('user_id', $user->getAuthIdentifier())
            ->delete() > 0;
    }

    public function browserSessions(Request $request, User $user): array
    {
        if (config('session.driver') !== 'database') {
            return [[
                'id' => $request->hasSession() ? $request->session()->getId() : 'session',
                'name' => 'Current browser',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'last_used_at' => now()->toIso8601String(),
                'current' => true,
            ]];
        }

        $currentId = $request->hasSession() ? $request->session()->getId() : '';

        return DB::table(config('session.table', 'sessions'))
            ->where('user_id', $user->getAuthIdentifier())
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
                'current' => hash_equals((string) $session->id, $currentId),
            ])->values()->all();
    }

    public function userPayload(User $user): array
    {
        $roleRank = ['owner' => 0, 'admin' => 1, 'manager' => 2, 'staff' => 3, 'readonly' => 4];
        $membership = $user->memberships()->with('organization')->where('status', 'active')->get()
            ->sort(function ($left, $right) use ($roleRank): int {
                $byRole = ($roleRank[$left->role] ?? 99) <=> ($roleRank[$right->role] ?? 99);

                return $byRole !== 0 ? $byRole : ((int) $left->organization_id <=> (int) $right->organization_id);
            })->first();

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $membership?->role,
            'organization_id' => $membership?->organization_id ? (string) $membership->organization_id : null,
            'organization_name' => $membership?->organization?->name,
        ];
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
}
