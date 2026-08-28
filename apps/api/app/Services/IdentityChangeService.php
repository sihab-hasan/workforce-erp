<?php

namespace App\Services;

use App\Contracts\SmsProviderInterface;
use App\Mail\VerificationCodeMail;
use App\Models\User;
use App\Models\VerificationChallenge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class IdentityChangeService
{
    public function __construct(private readonly SessionSecurityService $sessions, private readonly SecurityAuditService $audit, private readonly SmsProviderInterface $sms) {}

    public function requestEmail(Request $r, string $email): VerificationChallenge
    {
        $this->sessions->requireRecentVerification($r);
        $email = Str::lower(trim($email));
        if (User::query()->where('email', $email)->whereKeyNot($r->user()->id)->exists()) {
            abort(422, 'That email address cannot be used.');
        }$c = $this->challenge($r->user(), 'email_verification', 'email', ['new_email' => $email]);
        $code = $this->code();
        $c->forceFill(['code_hash' => Hash::make($code)])->save();
        Mail::to($email)->send(new VerificationCodeMail($code, 5, 'email_change'));

        return $c;
    }

    public function confirmEmail(Request $r, VerificationChallenge $c, string $code): void
    {
        $this->assert($r, $c, 'email_verification', $code);
        $new = (string) ($c->metadata['new_email'] ?? '');
        if ($new === '' || User::query()->where('email', $new)->whereKeyNot($r->user()->id)->exists()) {
            abort(422, 'That email address cannot be used.');
        }$old = $r->user()->email;
        $r->user()->forceFill(['email' => $new, 'email_verified_at' => now(), 'auth_version' => (int) $r->user()->auth_version + 1])->save();
        $this->sessions->revokeAll($r->user());
        $this->audit->record('email.changed', $r->user(), ['subject_user_id' => $r->user()->id, 'before' => ['email' => $old], 'after' => ['email' => $new]]);
    }

    public function requestPhone(Request $r, string $phone): VerificationChallenge
    {
        $this->sessions->requireRecentVerification($r);
        if (User::query()->where('phone', $phone)->whereKeyNot($r->user()->id)->exists()) {
            abort(422, 'That phone number cannot be used.');
        }$c = $this->challenge($r->user(), 'phone_verification', 'sms', ['new_phone' => $phone]);
        $code = $this->code();
        $c->forceFill(['code_hash' => Hash::make($code)])->save();
        $this->sms->send($phone, "Workforce ERP verification code: {$code}. Expires in 5 minutes.");

        return $c;
    }

    public function confirmPhone(Request $r, VerificationChallenge $c, string $code): void
    {
        $this->assert($r, $c, 'phone_verification', $code);
        $new = (string) ($c->metadata['new_phone'] ?? '');
        if (! preg_match('/^\+[1-9]\d{7,14}$/', $new)) {
            abort(422, 'Invalid phone number.');
        }$old = $r->user()->phone;
        $r->user()->forceFill(['phone' => $new, 'phone_verified_at' => now(), 'auth_version' => (int) $r->user()->auth_version + 1])->save();
        $this->sessions->revokeAll($r->user());
        $this->audit->record('phone.changed', $r->user(), ['subject_user_id' => $r->user()->id, 'before' => ['phone' => $old], 'after' => ['phone' => $new]]);
    }

    private function challenge(User $u, string $purpose, string $method, array $meta): VerificationChallenge
    {
        return VerificationChallenge::query()->create(['id' => (string) Str::uuid(), 'user_id' => $u->id, 'purpose' => $purpose, 'primary_authentication_method' => 'session', 'available_methods' => [$method], 'selected_method' => $method, 'expires_at' => now()->addMinutes(5), 'max_attempts' => (int) config('security.mfa.max_attempts', 5), 'resend_available_at' => now()->addSeconds(60), 'client' => 'erp', 'metadata' => $meta]);
    }

    private function assert(Request $r, VerificationChallenge $c, string $purpose, string $code): void
    {
        if ((int) $c->user_id !== (int) $r->user()->id || ! hash_equals($c->purpose, $purpose) || $c->consumed_at || now()->gte($c->expires_at)) {
            abort(400, 'Invalid or expired verification challenge.');
        }if ($c->attempt_count >= $c->max_attempts) {
            abort(429, 'Too many verification attempts.');
        }if (! $c->code_hash || ! Hash::check($code, $c->code_hash)) {
            $c->increment('attempt_count');
            abort(400, 'Invalid or expired verification code.');
        }$c->forceFill(['consumed_at' => now(), 'code_hash' => null])->save();
    }

    private function code(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
