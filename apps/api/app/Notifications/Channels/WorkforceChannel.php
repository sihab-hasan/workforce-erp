<?php

namespace App\Notifications\Channels;

use App\Events\NotificationBroadcast;
use App\Models\User;
use App\Models\WorkforceNotification;
use Illuminate\Notifications\Notification;

/**
 * Stores a notification in the existing `workforce_notifications` table so the
 * current NotificationController REST contract keeps working unchanged, then
 * broadcasts it for realtime delivery.
 */
class WorkforceChannel
{
    public function send(User $notifiable, Notification $notification): void
    {
        $payload = $notification->toWorkforce($notifiable);

        $record = WorkforceNotification::create([
            'organization_id' => $payload['organization_id'] ?? null,
            'user_id' => $notifiable->getKey(),
            'type' => $payload['type'],
            'title' => $payload['title'],
            'message' => $payload['message'] ?? null,
            'action_url' => $payload['action_url'] ?? null,
            'data' => $payload['data'] ?? [],
        ]);

        event(new NotificationBroadcast($record));
    }
}
