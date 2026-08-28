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
    public function __construct(private readonly SessionSecurityService $sessions, private readonly SecurityAuditService $audit) {}

    public function sendResetLink(string $email): void
    {
        $user = User::query()->where('email', strtolower(trim($email)))->first();
        if (! $user || $user->status !== 'active' || $user->locked_at || $user->memberships()->where('status', 'suspended')->exists()) {
            return;
        }
        try {
            $status = Password::sendResetLink(['email' => $user->email]);
        } catch (\Throwable $e) {
            DB::table((string) config('auth.passwords.users.table', 'password_reset_tokens'))->where('email', $email)->delete();
            Log::warning('Password reset email could not be sent.', ['user_id' => $user->id, 'exception' => $e::class]);

            return;
        }
        if (! in_array($status, [Password::RESET_LINK_SENT, Password::RESET_THROTTLED], true)) {
            Log::warning('Password reset link could not be created.', ['user_id' => $user->id, 'status' => $status]);
        }
    }

    public function reset(array $d): void
    {
        $user = User::query()->where('email', $d['email'])->first();
        if (! $user || $user->status !== 'active') {
            $this->invalid();
        }
        $status = Password::reset(['email' => $d['email'], 'password' => $d['password'], 'password_confirmation' => $d['password_confirmation'] ?? $d['password'], 'token' => $d['token']], function (User $u, string $password) {
            $u->forceFill(['password' => Hash::make($password), 'password_initialized_at' => now(), 'remember_token' => Str::random(60), 'auth_version' => (int) $u->auth_version + 1])->save();
            $u->tokens()->delete();
            $this->sessions->revokeAll($u);
            $this->audit->record('password.reset', $u, ['subject_user_id' => $u->id]);
            event(new PasswordReset($u));
        });
        if ($status !== Password::PASSWORD_RESET) {
            $this->invalid();
        }
    }

    public function change(User $u, string $current, string $next): void
    {
        if (! Hash::check($current, $u->password)) {
            throw ValidationException::withMessages(['current_password' => ['The current password is incorrect.']]);
        }
        if (Hash::check($next, $u->password)) {
            throw ValidationException::withMessages(['password' => ['The new password must be different from the current password.']]);
        }
        $u->forceFill(['password' => Hash::make($next), 'password_initialized_at' => now(), 'remember_token' => Str::random(60), 'auth_version' => (int) $u->auth_version + 1])->save();
        $u->tokens()->delete();
        $this->sessions->revokeAll($u);
        $this->audit->record('password.changed', $u, ['subject_user_id' => $u->id]);
    }

    private function invalid(): never
    {
        throw ValidationException::withMessages(['email' => ['This password reset link is invalid or has expired.']]);
    }
}
