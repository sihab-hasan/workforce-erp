<?php

namespace App\Services;

use App\Models\SecurityAuditEvent;
use App\Models\User;
use Illuminate\Http\Request;

class RiskService
{
    public function signals(User $user, ?Request $request = null): array
    {
        $request ??= request() instanceof Request ? request() : null;
        $flags = [];

        if ($user->locked_at || $user->status !== 'active') {
            $flags[] = 'account_unavailable';
        }

        $failedLogins = SecurityAuditEvent::query()
            ->where('subject_user_id', $user->id)
            ->where('event_type', 'login.failed')
            ->where('created_at', '>=', now()->subMinutes(15))
            ->count();
        if ($failedLogins >= (int) config('security.risk.failed_login_threshold', 5)) {
            $flags[] = 'high_failed_login_count';
        }

        $failedOtp = SecurityAuditEvent::query()
            ->where('subject_user_id', $user->id)
            ->where('event_type', 'verification.failed')
            ->where('created_at', '>=', now()->subMinutes(10))
            ->count();
        if ($failedOtp >= (int) config('security.risk.failed_verification_threshold', 4)) {
            $flags[] = 'rapid_verification_failures';
        }

        $metadata = $user->security_metadata ?: [];
        if ($request) {
            $ip = (string) $request->ip();
            $userAgentHash = hash('sha256', (string) $request->userAgent());
            $lastIp = (string) ($metadata['last_successful_ip'] ?? '');
            $lastUserAgentHash = (string) ($metadata['last_user_agent_hash'] ?? '');

            if ($lastIp !== '' && $ip !== '' && ! hash_equals($lastIp, $ip)) {
                $flags[] = 'new_network';
            }
            if ($lastUserAgentHash !== '' && ! hash_equals($lastUserAgentHash, $userAgentHash)) {
                $flags[] = 'new_device';
            }
        }

        $recentFactorChange = SecurityAuditEvent::query()
            ->where('subject_user_id', $user->id)
            ->whereIn('event_type', ['factor.added', 'factor.removed', 'email.changed', 'phone.changed'])
            ->where('created_at', '>=', now()->subHours(24))
            ->exists();
        if ($recentFactorChange) {
            $flags[] = 'recent_security_factor_change';
        }

        return array_values(array_unique($flags));
    }

    public function requiresVerification(User $user, ?Request $request = null): bool
    {
        return $this->signals($user, $request) !== [];
    }

    public function recordSuccessfulAuthentication(User $user, Request $request): void
    {
        $metadata = $user->security_metadata ?: [];
        $metadata['last_successful_ip'] = (string) $request->ip();
        $metadata['last_user_agent_hash'] = hash('sha256', (string) $request->userAgent());
        $metadata['last_successful_auth_at'] = now()->toIso8601String();

        $user->forceFill(['security_metadata' => $metadata])->save();
    }
}
