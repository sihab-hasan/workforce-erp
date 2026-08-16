<?php

namespace App\Services;

use App\Mail\OtpMail;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    private const OTP_TTL_MINUTES = 5;

    private const MAX_ATTEMPTS = 5;

    public function __construct(private readonly AuthService $authService)
    {
    }

    public function request(string $email): void
    {
        $user = User::query()->where('email', $email)->first();

        if (! $user || $this->authService->isBlockedFromSignIn($user, true)) {
            // Keep the public response indistinguishable from a valid account request.
            return;
        }

        $recentOtpExists = Otp::query()
            ->where('email', $email)
            ->whereNull('verified_at')
            ->where('created_at', '>', now()->subMinute())
            ->exists();

        if ($recentOtpExists) {
            // Idempotent cooldown: returning the same public response for known and
            // unknown accounts avoids an account-enumeration side channel.
            return;
        }

        $code = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        $otp = Otp::create([
            'email' => $email,
            'code' => Hash::make($code),
            'expires_at' => now()->addMinutes(self::OTP_TTL_MINUTES),
            'attempts' => 0,
        ]);

        try {
            Mail::to($email)->send(new OtpMail($code, self::OTP_TTL_MINUTES));
        } catch (\Throwable $exception) {
            // Never leave a code that the user could not receive and never log
            // the secret itself. The public controller still returns the same
            // response so mail outages do not become an account-enumeration oracle.
            $otp->delete();
            Log::warning('OTP email could not be sent.', [
                'user_id' => $user->id,
                'exception' => $exception::class,
            ]);
        }
    }

    /**
     * @return User
     */
    public function verify(string $email, string $code): User
    {
        $otp = Otp::query()
            ->where('email', $email)
            ->whereNull('verified_at')
            ->latest()
            ->first();

        if (! $otp || $otp->isExpired()) {
            abort(400, 'Invalid or expired one-time code.');
        }

        if ($otp->attempts >= self::MAX_ATTEMPTS) {
            abort(429, 'Too many failed attempts. Please request a new one-time code.');
        }

        if (! Hash::check($code, $otp->code)) {
            $otp->increment('attempts');
            abort(400, 'Invalid or expired one-time code.');
        }

        $user = User::query()->where('email', $email)->first();
        if (! $user || $this->authService->isBlockedFromSignIn($user, true)) {
            // Do not consume a code for an account that is no longer eligible.
            abort(400, 'Invalid or expired one-time code.');
        }

        $otp->update(['verified_at' => now()]);
        if (! $user->email_verified_at) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }
        $this->authService->activateInvitations($user);

        return $user;
    }
}
