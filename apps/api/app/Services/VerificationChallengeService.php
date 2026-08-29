<?php

namespace App\Services;

use App\Contracts\SmsProviderInterface;
use App\Mail\VerificationCodeMail;
use App\Models\User;
use App\Models\VerificationChallenge;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class VerificationChallengeService
{
    public const METHODS = ['totp', 'email', 'sms'];

    public const PURPOSES = ['login', 'step_up', 'email_verification', 'phone_verification', 'factor_management', 'sensitive_action', 'registration', 'email_change', 'phone_change'];

    public function __construct(private readonly TotpService $totp, private readonly SmsProviderInterface $sms, private readonly SecurityAuditService $audit) {}

    public function availableMethods(User $user): array
    {
        $m = [];
        if ($user->authenticatorFactors()->whereNotNull('confirmed_at')->exists()) {
            $m[] = 'totp';
        } if ($user->email_verified_at) {
            $m[] = 'email';
        } if ($user->phone_verified_at && $user->phone) {
            $m[] = 'sms';
        }

        return $m;
    }

    public function create(User $user, string $purpose, string $primary, string $client = 'erp', ?array $methods = null, array $metadata = []): VerificationChallenge
    {
        if (! in_array($purpose, self::PURPOSES, true)) {
            abort(422, 'Unsupported verification purpose.');
        } $methods = $methods ?? $this->availableMethods($user);
        if ($methods === []) {
            abort(428, 'A verified authentication factor is required.');
        }
        $challenge = VerificationChallenge::query()->create(['id' => (string) Str::uuid(), 'user_id' => $user->id, 'purpose' => $purpose, 'primary_authentication_method' => $primary, 'available_methods' => array_values(array_intersect(self::METHODS, $methods)), 'expires_at' => now()->addMinutes((int) config('security.mfa.challenge_ttl_minutes', 5)), 'max_attempts' => (int) config('security.mfa.max_attempts', 5), 'client' => $client, 'metadata' => $metadata]);
        $this->audit->record('verification.challenge', $user, ['subject_user_id' => $user->id, 'authentication_method' => $primary]);

        return $challenge;
    }

    public function selectAndSend(VerificationChallenge $challenge, string $method): VerificationChallenge
    {
        $this->assertUsable($challenge);
        if (! in_array($method, $challenge->available_methods, true)) {
            abort(422, 'That verification method is not available for this challenge.');
        }
        $challenge->selected_method = $method;
        if (in_array($method, ['email', 'sms'], true)) {
            $this->sendCode($challenge, $method);
        } else {
            $challenge->save();
        }

        return $challenge->fresh();
    }

    public function resend(VerificationChallenge $challenge): VerificationChallenge
    {
        $this->assertUsable($challenge);
        if (! $challenge->selected_method || ! in_array($challenge->selected_method, ['email', 'sms'], true)) {
            abort(422, 'Select Email Code or SMS Code before resending.');
        } if ($challenge->resend_available_at && now()->lt($challenge->resend_available_at)) {
            abort(429, 'Please wait before requesting another code.');
        } $this->sendCode($challenge, $challenge->selected_method);

        return $challenge->fresh();
    }

    public function verify(VerificationChallenge $challenge, string $purpose, string $code): array
    {
        $this->assertUsable($challenge);
        if (! hash_equals($challenge->purpose, $purpose)) {
            abort(400, 'Invalid or expired verification challenge.');
        } if (! $challenge->selected_method) {
            abort(422, 'Choose a verification method first.');
        }
        if ($challenge->attempt_count >= $challenge->max_attempts) {
            abort(429, 'Too many verification attempts.');
        } $user = $challenge->user;
        $ok = false;
        if ($challenge->selected_method === 'totp') {
            $factor = $user->authenticatorFactors()->whereNotNull('confirmed_at')->latest('confirmed_at')->first();
            $ok = $factor ? $this->totp->verify($factor->secret, $code) : false;
            if ($ok) {
                $factor->forceFill(['last_used_at' => now()])->save();
            }
        } else {
            $ok = $challenge->code_hash ? Hash::check($code, $challenge->code_hash) : false;
        }
        if (! $ok) {
            $challenge->increment('attempt_count');
            $this->audit->record('verification.failed', $user, ['subject_user_id' => $user->id, 'success' => false, 'failure_reason' => 'invalid_code']);
            abort(400, 'Invalid or expired verification code.');
        }
        $challenge->forceFill(['consumed_at' => now(), 'code_hash' => null])->save();
        $this->audit->record('verification.success', $user, ['subject_user_id' => $user->id, 'authentication_method' => $this->finalAuthenticationMethod($challenge)]);

        return ['user' => $user, 'authentication_method' => $this->finalAuthenticationMethod($challenge), 'method' => $challenge->selected_method];
    }

    public function finalAuthenticationMethod(VerificationChallenge $challenge): string
    {
        $primary = $challenge->primary_authentication_method ?: 'verified';
        $factor = $challenge->selected_method ?: 'verified';

        return str_ends_with($primary, '+'.$factor) ? $primary : $primary.'+'.$factor;
    }

    private function sendCode(VerificationChallenge $challenge, string $method): void
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user = $challenge->user;
        $minutes = (int) config('security.mfa.challenge_ttl_minutes', 5);
        if ($method === 'email') {
            Mail::to($user->email)->send(new VerificationCodeMail($code, $minutes, $challenge->purpose));
        } else {
            if (! $user->phone) {
                abort(422, 'A verified phone number is required.');
            } $this->sms->send($user->phone, "Workforce ERP verification code: {$code}. Expires in {$minutes} minutes.");
        }
        $challenge->forceFill(['selected_method' => $method, 'code_hash' => Hash::make($code), 'attempt_count' => 0, 'resend_available_at' => now()->addSeconds((int) config('security.mfa.resend_cooldown_seconds', 60))])->save();
    }

    private function assertUsable(VerificationChallenge $challenge): void
    {
        if ($challenge->consumed_at || now()->gte($challenge->expires_at)) {
            abort(400, 'Invalid or expired verification challenge.');
        }
    }
}
