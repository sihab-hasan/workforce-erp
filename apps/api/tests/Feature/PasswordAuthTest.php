<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordAuthTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();
        Notification::fake();

        $this->organization = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
        $this->user = User::create([
            'name' => 'Password User',
            'email' => 'password@example.com',
            'password' => Hash::make('CurrentPass123!'),
            'email_verified_at' => now(),
        ]);
        $this->organization->members()->attach($this->user->id, [
            'role' => 'staff',
            'status' => 'active',
        ]);
    }

    public function test_forgot_password_sends_real_reset_notification_for_active_account(): void
    {
        $this->postJson('/api/v1/auth/password/forgot', [
            'email' => ' PASSWORD@example.com ',
        ])->assertOk()->assertJson([
            'success' => true,
            'message' => 'If the account is eligible and email delivery is available, a password reset link will arrive shortly.',
        ]);

        Notification::assertSentTo($this->user, ResetPassword::class);
        $this->assertDatabaseHas('password_reset_tokens', ['email' => $this->user->email]);
    }

    public function test_forgot_password_is_generic_for_unknown_or_ineligible_account(): void
    {
        $this->postJson('/api/v1/auth/password/forgot', [
            'email' => 'unknown@example.com',
        ])->assertOk()->assertJsonPath('success', true);

        $this->user->memberships()->update(['status' => 'suspended']);
        $this->postJson('/api/v1/auth/password/forgot', [
            'email' => $this->user->email,
        ])->assertOk()->assertJsonPath('success', true);

        Notification::assertNothingSent();
    }

    public function test_password_reset_updates_password_and_revokes_all_existing_api_tokens(): void
    {
        $firstToken = $this->user->createToken('first')->plainTextToken;
        $this->user->createToken('second');
        $resetToken = Password::createToken($this->user);

        $this->postJson('/api/v1/auth/password/reset', [
            'token' => $resetToken,
            'email' => $this->user->email,
            'password' => 'NewSecurePass123!',
            'password_confirmation' => 'NewSecurePass123!',
        ])->assertOk()->assertJsonPath('success', true);

        $this->assertTrue(Hash::check('NewSecurePass123!', $this->user->fresh()->password));
        $this->assertSame(0, $this->user->tokens()->count());

        $this->withHeader('Authorization', "Bearer {$firstToken}")
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized();
    }

    public function test_invalid_reset_token_uses_generic_validation_error(): void
    {
        $this->postJson('/api/v1/auth/password/reset', [
            'token' => 'invalid-token',
            'email' => $this->user->email,
            'password' => 'NewSecurePass123!',
            'password_confirmation' => 'NewSecurePass123!',
        ])->assertUnprocessable()->assertJsonPath(
            'errors.email.0',
            'This password reset link is invalid or has expired.'
        );
    }

    public function test_password_change_requires_current_password_and_revokes_all_sessions(): void
    {
        $currentToken = $this->user->createToken('current')->plainTextToken;
        $this->user->createToken('other');

        $this->withHeader('Authorization', "Bearer {$currentToken}")
            ->postJson('/api/v1/auth/password/change', [
                'current_password' => 'wrong-password',
                'password' => 'ChangedPass123!',
                'password_confirmation' => 'ChangedPass123!',
            ])->assertUnprocessable()
            ->assertJsonPath('errors.current_password.0', 'The current password is incorrect.');

        $this->assertSame(2, $this->user->tokens()->count());

        $this->withHeader('Authorization', "Bearer {$currentToken}")
            ->postJson('/api/v1/auth/password/change', [
                'current_password' => 'CurrentPass123!',
                'password' => 'ChangedPass123!',
                'password_confirmation' => 'ChangedPass123!',
            ])->assertOk()->assertJsonPath('success', true);

        $this->assertSame(0, $this->user->tokens()->count());
        $this->assertTrue(Hash::check('ChangedPass123!', $this->user->fresh()->password));
    }

    public function test_authenticated_user_can_list_and_revoke_only_own_sessions(): void
    {
        $current = $this->user->createToken('current');
        $other = $this->user->createToken('other');
        $currentPlainText = $current->plainTextToken;

        $foreign = User::create([
            'name' => 'Foreign User',
            'email' => 'foreign@example.com',
            'password' => Hash::make('ForeignPass123!'),
        ]);
        $foreignToken = $foreign->createToken('foreign')->accessToken;

        $this->withHeader('Authorization', "Bearer {$currentPlainText}")
            ->getJson('/api/v1/auth/sessions')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->withHeader('Authorization', "Bearer {$currentPlainText}")
            ->deleteJson('/api/v1/auth/sessions/'.$foreignToken->id)
            ->assertNotFound();

        $this->withHeader('Authorization', "Bearer {$currentPlainText}")
            ->deleteJson('/api/v1/auth/sessions/'.$other->accessToken->id)
            ->assertOk();

        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $other->accessToken->id]);
        $this->assertDatabaseHas('personal_access_tokens', ['id' => $foreignToken->id]);
    }
}
