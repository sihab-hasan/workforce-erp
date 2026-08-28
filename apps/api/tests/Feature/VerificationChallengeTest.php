<?php

namespace Tests\Feature;

use App\Mail\VerificationCodeMail;
use App\Models\User;
use App\Services\VerificationChallengeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class VerificationChallengeTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_code_is_hashed_single_use_and_purpose_bound(): void
    {
        Mail::fake();
        $user = User::create([
            'name' => 'Verified User', 'email' => 'verified@example.com',
            'password' => Hash::make('long enough test passphrase'),
            'email_verified_at' => now(),
        ]);
        $service = app(VerificationChallengeService::class);
        $challenge = $service->create($user, 'login', 'password', 'erp', ['email']);
        $challenge = $service->selectAndSend($challenge, 'email');

        $code = null;
        Mail::assertSent(VerificationCodeMail::class, function (VerificationCodeMail $mail) use (&$code): bool {
            $code = $mail->code;

            return preg_match('/^\d{6}$/', $mail->code) === 1;
        });
        $this->assertNotNull($challenge->code_hash);
        $this->assertNotSame($code, $challenge->code_hash);
        $this->assertTrue(Hash::check((string) $code, (string) $challenge->code_hash));

        $this->expectException(HttpException::class);
        $service->verify($challenge->fresh(), 'step_up', (string) $code);
    }

    public function test_consumed_code_cannot_be_reused(): void
    {
        Mail::fake();
        $user = User::create([
            'name' => 'Verified User', 'email' => 'verified2@example.com',
            'password' => Hash::make('long enough test passphrase'),
            'email_verified_at' => now(),
        ]);
        $service = app(VerificationChallengeService::class);
        $challenge = $service->selectAndSend($service->create($user, 'login', 'password', 'erp', ['email']), 'email');
        $code = null;
        Mail::assertSent(VerificationCodeMail::class, function (VerificationCodeMail $mail) use (&$code): bool {
            $code = $mail->code;

            return true;
        });
        $service->verify($challenge->fresh(), 'login', (string) $code);
        $this->assertNotNull($challenge->fresh()->consumed_at);
        $this->assertNull($challenge->fresh()->code_hash);

        $this->expectException(HttpException::class);
        $service->verify($challenge->fresh(), 'login', (string) $code);
    }
}
