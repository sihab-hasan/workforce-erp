<?php

namespace App\Notifications;

use App\Models\Document;
use App\Notifications\Channels\WorkforceChannel;
use Illuminate\Notifications\Notification;

/** Sent to members holding `document.view` when an office document is published. */
class DocumentShared extends Notification
{
    public function __construct(private readonly Document $document) {}

    /** @return array<int, class-string> */
    public function via($notifiable): array
    {
        return [WorkforceChannel::class];
    }

    /** @return array<string, mixed> */
    public function toWorkforce($notifiable): array
    {
        $uploader = $this->document->uploader?->name ?? 'A teammate';

        return [
            'organization_id' => $this->document->organization_id,
            'type' => 'document.shared',
            'title' => 'New office document shared',
            'message' => $uploader.' shared "'.$this->document->name.'".',
            'action_url' => '/documents',
            'data' => [
                'document_id' => (string) $this->document->id,
                'category' => $this->document->category,
            ],
        ];
    }
}
