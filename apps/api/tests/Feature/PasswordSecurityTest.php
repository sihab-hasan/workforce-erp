<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_is_enumeration_safe(): void
    {
        Notification::fake();
        $user = User::create([
            'name' => 'User',
            'email' => 'password@example.com',
            'password' => Hash::make('current long test passphrase'),
            'status' => 'active',
        ]);

        $this->postJson('/api/v1/auth/password/forgot', ['email' => $user->email])
            ->assertOk()
            ->assertJsonPath('message', 'If the account is eligible, password reset instructions will arrive shortly.');

        $this->postJson('/api/v1/auth/password/forgot', ['email' => 'not-found@example.com'])
            ->assertOk()
            ->assertJsonPath('message', 'If the account is eligible, password reset instructions will arrive shortly.');

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_password_reset_changes_password_and_increments_auth_version(): void
    {
        $user = User::create([
            'name' => 'User',
            'email' => 'reset@example.com',
            'password' => Hash::make('current long test passphrase'),
            'status' => 'active',
            'auth_version' => 1,
        ]);

        $token = Password::createToken($user);
        $this->postJson('/api/v1/auth/password/reset', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'a new and sufficiently long passphrase',
            'password_confirmation' => 'a new and sufficiently long passphrase',
        ])->assertOk();

        $fresh = $user->fresh();
        $this->assertTrue(Hash::check('a new and sufficiently long passphrase', $fresh->password));
        $this->assertSame(2, (int) $fresh->auth_version);
    }
}
