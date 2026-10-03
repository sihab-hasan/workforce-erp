<?php

namespace App\Notifications;

use App\Notifications\Channels\WorkforceChannel;
use Illuminate\Notifications\Notification;

/** Sent to reviewers holding `leave.approve` when an employee files a request. */
class LeaveRequestSubmitted extends Notification
{
    public function __construct(
        private readonly int $organizationId,
        private readonly string $employeeName,
    ) {}

    /** @return array<int, class-string> */
    public function via($notifiable): array
    {
        return [WorkforceChannel::class];
    }

    /** @return array<string, mixed> */
    public function toWorkforce($notifiable): array
    {
        return [
            'organization_id' => $this->organizationId,
            'type' => 'leave.requested',
            'title' => 'Leave approval required',
            'message' => $this->employeeName.' submitted a leave request.',
            'action_url' => '/approvals',
            'data' => [],
        ];
    }
}
