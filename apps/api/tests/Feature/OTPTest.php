<?php

namespace Tests\Feature;

use App\Mail\OtpMail;
use App\Models\Organization;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class OTPTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();

        $this->organization = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
        $this->user = User::create([
            'name' => 'OTP User',
            'email' => 'otp-user@example.com',
            'password' => Hash::make('password'),
        ]);
        $this->organization->members()->attach($this->user->id, [
            'role' => 'staff',
            'status' => 'active',
        ]);
    }

    public function test_request_otp_success_and_hashes_code(): void
    {
        $this->postJson('/api/v1/auth/otp/request', [
            'email' => ' OTP-USER@example.com ',
        ])->assertOk()->assertJson([
            'success' => true,
            'message' => 'If the account is eligible and email delivery is available, a one-time code will arrive shortly.',
        ]);

        $otp = Otp::where('email', 'otp-user@example.com')->firstOrFail();
        $sentCode = $this->sentCodeFor('otp-user@example.com');

        $this->assertNotSame($sentCode, $otp->code);
        $this->assertTrue(Hash::check($sentCode, $otp->code));
        $this->assertTrue($otp->expires_at->lessThanOrEqualTo(now()->addMinutes(5)));
    }

    public function test_request_otp_does_not_reveal_unknown_or_ineligible_accounts(): void
    {
        $this->postJson('/api/v1/auth/otp/request', [
            'email' => 'doesnotexist@example.com',
        ])->assertOk()->assertJsonPath('success', true);

        $outsider = User::create([
            'name' => 'No Org',
            'email' => 'no-org@example.com',
            'password' => Hash::make('password'),
        ]);

        $this->postJson('/api/v1/auth/otp/request', [
            'email' => $outsider->email,
        ])->assertOk()->assertJsonPath('success', true);

        $this->assertDatabaseMissing('otps', ['email' => 'doesnotexist@example.com']);
        $this->assertDatabaseMissing('otps', ['email' => 'no-org@example.com']);
        Mail::assertNothingSent();
    }

    public function test_otp_cooldown_is_idempotent_instead_of_leaking_account_existence(): void
    {
        $this->postJson('/api/v1/auth/otp/request', [
            'email' => $this->user->email,
        ])->assertOk();

        $this->postJson('/api/v1/auth/otp/request', [
            'email' => $this->user->email,
        ])->assertOk()->assertJsonPath('success', true);

        $this->assertSame(1, Otp::where('email', $this->user->email)->count());
        Mail::assertSent(OtpMail::class, 1);
    }

    public function test_verify_otp_success(): void
    {
        $this->postJson('/api/v1/auth/otp/request', ['email' => $this->user->email])->assertOk();
        $otp = Otp::where('email', $this->user->email)->firstOrFail();
        $code = $this->sentCodeFor($this->user->email);

        $this->postJson('/api/v1/auth/otp/verify', [
            'email' => $this->user->email,
            'code' => $code,
        ])->assertOk()
            ->assertJsonStructure(['success', 'user' => ['id', 'name', 'email', 'role']])
            ->assertJsonPath('user.role', 'staff');

        $this->assertNotNull($otp->fresh()->verified_at);
        $this->assertNotNull($this->user->fresh()->email_verified_at);
    }

    public function test_otp_browser_login_does_not_issue_a_personal_access_token(): void
    {
        $this->postJson('/api/v1/auth/otp/request', ['email' => $this->user->email])->assertOk();
        $code = $this->sentCodeFor($this->user->email);

        $this->postJson('/api/v1/auth/otp/verify', [
            'email' => $this->user->email,
            'code' => $code,
            'client' => 'admin',
        ])->assertOk();

        $this->assertSame(0, $this->user->tokens()->count());
        $this->assertAuthenticatedAs($this->user);
    }

    public function test_invited_membership_is_activated_by_valid_otp(): void
    {
        $this->user->memberships()->update(['status' => 'invited']);
        $this->postJson('/api/v1/auth/otp/request', ['email' => $this->user->email])->assertOk();
        $code = $this->sentCodeFor($this->user->email);

        $this->postJson('/api/v1/auth/otp/verify', [
            'email' => $this->user->email,
            'code' => $code,
        ])->assertOk();

        $this->assertDatabaseHas('organization_members', [
            'organization_id' => $this->organization->id,
            'user_id' => $this->user->id,
            'status' => 'active',
        ]);
    }

    public function test_invalid_and_expired_otp_use_generic_error(): void
    {
        Otp::create([
            'email' => $this->user->email,
            'code' => Hash::make('123456'),
            'expires_at' => now()->subMinute(),
            'attempts' => 0,
        ]);

        $this->postJson('/api/v1/auth/otp/verify', [
            'email' => $this->user->email,
            'code' => '123456',
        ])->assertStatus(400)->assertJson([
            'success' => false,
            'message' => 'Invalid or expired one-time code.',
        ]);

        Otp::query()->delete();
        $this->postJson('/api/v1/auth/otp/request', ['email' => $this->user->email])->assertOk();

        $this->postJson('/api/v1/auth/otp/verify', [
            'email' => $this->user->email,
            'code' => '000000',
        ])->assertStatus(400)->assertJson([
            'success' => false,
            'message' => 'Invalid or expired one-time code.',
        ]);

        $this->assertSame(1, Otp::where('email', $this->user->email)->firstOrFail()->attempts);
    }

    public function test_verify_otp_brute_force_lockout(): void
    {
        Otp::create([
            'email' => $this->user->email,
            'code' => Hash::make('123456'),
            'expires_at' => now()->addMinutes(5),
            'attempts' => 5,
        ]);

        $this->postJson('/api/v1/auth/otp/verify', [
            'email' => $this->user->email,
            'code' => '123456',
        ])->assertStatus(429)->assertJson([
            'success' => false,
            'message' => 'Too many failed attempts. Please request a new one-time code.',
        ]);
    }

    public function test_suspended_membership_cannot_request_otp(): void
    {
        $this->user->memberships()->update(['status' => 'suspended']);

        $this->postJson('/api/v1/auth/otp/request', [
            'email' => $this->user->email,
        ])->assertOk()->assertJsonPath('success', true);

        $this->assertDatabaseMissing('otps', ['email' => $this->user->email]);
        Mail::assertNothingSent();
    }

    private function sentCodeFor(string $email): string
    {
        $code = null;

        Mail::assertSent(OtpMail::class, function (OtpMail $mail) use ($email, &$code) {
            if (! $mail->hasTo($email)) {
                return false;
            }
            $code = $mail->code;
            $this->assertSame(5, $mail->expiresInMinutes);

            return true;
        });

        $this->assertIsString($code);
        $this->assertSame(6, strlen($code));

        return $code;
    }
}
