<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordService
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    /**
     * Send a real Laravel password-reset notification only to an active
     * Workforce account. The caller always returns the same public response.
     */
    public function sendResetLink(string $email): void
    {
        $user = User::query()->where('email', $email)->first();

        if (! $user || $this->authService->isBlockedFromSignIn($user)) {
            return;
        }

        try {
            $status = Password::sendResetLink(['email' => $email]);
        } catch (\Throwable $exception) {
            // Keep public recovery responses indistinguishable when SMTP is down,
            // but remove a broker token that was never delivered to the user.
            $table = (string) config('auth.passwords.users.table', 'password_reset_tokens');
            DB::table($table)->where('email', $email)->delete();

            Log::warning('Password reset email could not be sent.', [
                'user_id' => $user->id,
                'exception' => $exception::class,
            ]);

            return;
        }

        if ($status !== Password::RESET_LINK_SENT && $status !== Password::RESET_THROTTLED) {
            Log::warning('Password reset link could not be created.', [
                'user_id' => $user->id,
                'status' => $status,
            ]);
        }
    }

    /**
     * @param  array{token:string,email:string,password:string,password_confirmation:string}  $data
     */
    public function reset(array $data): void
    {
        $user = User::query()->where('email', $data['email'])->first();

        if (! $user || $this->authService->isBlockedFromSignIn($user)) {
            $this->throwInvalidReset();
        }

        $status = Password::reset(
            [
                'email' => $data['email'],
                'password' => $data['password'],
                'password_confirmation' => $data['password_confirmation'],
                'token' => $data['token'],
            ],
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                // Account recovery is a high-risk event: all API sessions must
                // authenticate again with the new credential.
                $user->tokens()->delete();
                $this->authService->revokeAllBrowserSessions($user);

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            $this->throwInvalidReset();
        }
    }

    public function change(User $user, string $currentPassword, string $newPassword): void
    {
        if (! Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        if (Hash::check($newPassword, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The new password must be different from the current password.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($newPassword),
            'remember_token' => Str::random(60),
        ])->save();

        // Require a fresh sign-in everywhere after a password change.
        $user->tokens()->delete();
        $this->authService->revokeAllBrowserSessions($user);
    }

    private function throwInvalidReset(): never
    {
        throw ValidationException::withMessages([
            'email' => ['This password reset link is invalid or has expired.'],
        ]);
    }
}
