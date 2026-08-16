<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $code,
        public readonly int $expiresInMinutes,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Workforce ERP sign-in code',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: "Your one-time sign-in code is: <strong>{$this->code}</strong>. It expires in {$this->expiresInMinutes} minutes and can be used only once.",
        );
    }
}
