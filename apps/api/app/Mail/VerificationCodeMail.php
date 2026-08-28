<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerificationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly string $code, public readonly int $minutes, public readonly string $purpose = 'verification') {}

    public function build()
    {
        return $this->subject('Your Workforce ERP verification code')->view('emails.verification-code')->text('emails.verification-code-text');
    }
}
