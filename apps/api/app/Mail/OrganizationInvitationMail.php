<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrganizationInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly string $organizationName, public readonly string $url, public readonly string $expiresAt) {}

    public function build()
    {
        return $this->subject('Invitation to '.$this->organizationName.' on Workforce ERP')->view('emails.organization-invitation')->text('emails.organization-invitation-text');
    }
}
