<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkforceNotification extends Model
{
    use HasFactory;

    protected $table = 'workforce_notifications';

    protected $fillable = [
        'organization_id', 'user_id', 'type', 'title', 'message', 'action_url', 'data', 'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mirrors NotificationController::serialize() so broadcast payloads stay
     * byte-identical to the REST contract the ERP frontend already consumes.
     *
     * @return array<string, mixed>
     */
    public function toApiPayload(): array
    {
        return [
            'id' => (string) $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'action_url' => $this->action_url,
            'data' => $this->data ?? [],
            'read_at' => $this->read_at?->toIso8601String(),
            'is_read' => (bool) $this->read_at,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
