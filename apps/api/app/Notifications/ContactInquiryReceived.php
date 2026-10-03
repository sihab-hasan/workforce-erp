<?php

namespace App\Notifications;

use App\Models\ContactInquiry;
use App\Notifications\Channels\WorkforceChannel;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

/** Sent to platform administrators when a contact inquiry is submitted from the web portal. */
class ContactInquiryReceived extends Notification
{
    public function __construct(private readonly ContactInquiry $inquiry) {}

    /** @return array<int, class-string> */
    public function via($notifiable): array
    {
        return [WorkforceChannel::class];
    }

    /** @return array<string, mixed> */
    public function toWorkforce($notifiable): array
    {
        $prefix = $this->inquiry->company_name ? "{$this->inquiry->company_name}: " : '';

        return [
            'organization_id' => null,
            'type' => 'contact.inquiry',
            'title' => 'New Contact Inquiry: '.$this->inquiry->full_name,
            'message' => $prefix.Str::limit($this->inquiry->message, 110),
            'action_url' => '/admin/inquiries',
            'data' => [
                'inquiry_id' => (string) $this->inquiry->id,
                'name' => $this->inquiry->full_name,
                'email' => $this->inquiry->email,
                'company' => $this->inquiry->company_name,
            ],
        ];
    }
}
