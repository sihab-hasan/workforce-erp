<?php

namespace App\Notifications;

use App\Models\LeaveRequest;
use App\Notifications\Channels\WorkforceChannel;
use Illuminate\Notifications\Notification;

/** Sent to the employee whose leave request was approved or rejected. */
class LeaveRequestReviewed extends Notification
{
    public function __construct(
        private readonly LeaveRequest $leave,
        private readonly string $status,
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
            'organization_id' => $this->leave->organization_id,
            'type' => 'leave.'.$this->status,
            'title' => 'Leave request '.ucfirst($this->status),
            'message' => 'Your leave request from '.$this->leave->start_date->toDateString().' to '.$this->leave->end_date->toDateString().' was '.$this->status.'.',
            'action_url' => '/leave/'.$this->leave->id,
            'data' => [
                'leave_request_id' => (string) $this->leave->id,
                'status' => $this->status,
            ],
        ];
    }
}
