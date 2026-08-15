<?php

namespace Tests\Feature;

use App\Mail\OtpMail;
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

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();

        // Create mock user
        $this->user = User::create([
            'name' => 'OTP User',
            'email' => 'otp-user@example.com',
            'password' => Hash::make('password'),
        ]);
    }

    /**
     * Test requesting an OTP for an existing user.
     */
    public function test_request_otp_success(): void
    {
        $response = $this->postJson('/api/v1/auth/otp/request', [
            'email' => 'otp-user@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'OTP sent successfully.',
            ]);

        // Verify OTP was stored in the database
        $this->assertDatabaseHas('otps', [
            'email' => 'otp-user@example.com',
            'attempts' => 0,
            'verified_at' => null,
        ]);

        $otp = Otp::where('email', 'otp-user@example.com')->first();
        $this->assertNotNull($otp);
        $this->assertEquals(6, strlen($otp->code));

        // Verify mail was sent
        Mail::assertSent(OtpMail::class, function ($mail) {
            return $mail->hasTo('otp-user@example.com');
        });
    }

    /**
     * Test requesting an OTP for a non-existing user.
     */
    public function test_request_otp_non_existing_user(): void
    {
        $response = $this->postJson('/api/v1/auth/otp/request', [
            'email' => 'doesnotexist@example.com',
        ]);

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'We could not find a user with that email address.',
            ]);
    }

    /**
     * Test throttling duplicate OTP requests.
     */
    public function test_request_otp_throttling(): void
    {
        // First request
        $this->postJson('/api/v1/auth/otp/request', [
            'email' => 'otp-user@example.com',
        ])->assertStatus(200);

        // Immediate second request
        $response = $this->postJson('/api/v1/auth/otp/request', [
            'email' => 'otp-user@example.com',
        ]);

        $response->assertStatus(429)
            ->assertJson([
                'success' => false,
                'message' => 'Please wait before requesting another OTP.',
            ]);
    }

    /**
     * Test verifying a valid OTP code.
     */
    public function test_verify_otp_success(): void
    {
        // Request OTP
        $this->postJson('/api/v1/auth/otp/request', [
            'email' => 'otp-user@example.com',
        ])->assertStatus(200);

        $otp = Otp::where('email', 'otp-user@example.com')->first();

        // Verify code
        $response = $this->postJson('/api/v1/auth/otp/verify', [
            'email' => 'otp-user@example.com',
            'code' => $otp->code,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'token',
                'user' => ['id', 'name', 'email'],
            ])
            ->assertJson([
                'success' => true,
                'user' => [
                    'email' => 'otp-user@example.com',
                ],
            ]);

        // Verify status updated in DB
        $this->assertNotNull($otp->fresh()->verified_at);
    }

    /**
     * Test verifying an expired OTP code.
     */
    public function test_verify_expired_otp(): void
    {
        // Manually create an expired OTP
        $otp = Otp::create([
            'email' => 'otp-user@example.com',
            'code' => '123456',
            'expires_at' => now()->subMinutes(1),
            'attempts' => 0,
        ]);

        $response = $this->postJson('/api/v1/auth/otp/verify', [
            'email' => 'otp-user@example.com',
            'code' => '123456',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'OTP has expired.',
            ]);
    }

    /**
     * Test verifying an incorrect OTP code.
     */
    public function test_verify_invalid_otp(): void
    {
        // Request OTP
        $this->postJson('/api/v1/auth/otp/request', [
            'email' => 'otp-user@example.com',
        ])->assertStatus(200);

        $response = $this->postJson('/api/v1/auth/otp/verify', [
            'email' => 'otp-user@example.com',
            'code' => '000000', // Invalid code
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid OTP code.',
            ]);

        // Verify attempt counter incremented
        $otp = Otp::where('email', 'otp-user@example.com')->first();
        $this->assertEquals(1, $otp->attempts);
    }

    /**
     * Test brute-force protection locks out after 5 failed attempts.
     */
    public function test_verify_otp_brute_force_lockout(): void
    {
        // Create an OTP with 5 failed attempts
        Otp::create([
            'email' => 'otp-user@example.com',
            'code' => '123456',
            'expires_at' => now()->addMinutes(10),
            'attempts' => 5,
        ]);

        $response = $this->postJson('/api/v1/auth/otp/verify', [
            'email' => 'otp-user@example.com',
            'code' => '123456', // Even with correct code, it should block
        ]);

        $response->assertStatus(429)
            ->assertJson([
                'success' => false,
                'message' => 'Too many failed attempts. Please request a new OTP.',
            ]);
    }
}
