<?php

namespace App\Services;

use App\Models\SecurityAuditEvent;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SecurityAuditService
{
    public function record(string $eventType, ?User $actor = null, array $context = []): void
    {
        $request = request();
        SecurityAuditEvent::query()->create([
            'event_type' => $eventType, 'actor_user_id' => $actor?->id, 'subject_user_id' => $context['subject_user_id'] ?? null,
            'organization_id' => $context['organization_id'] ?? null, 'company_id' => $context['company_id'] ?? null,
            'session_id' => $request instanceof Request && $request->hasSession() ? $request->session()->getId() : null,
            'ip_address' => $request instanceof Request ? $request->ip() : null, 'user_agent' => $request instanceof Request ? $request->userAgent() : null,
            'authentication_method' => $request instanceof Request && $request->hasSession() ? $request->session()->get('authentication_method') : ($context['authentication_method'] ?? null),
            'resource_type' => $context['resource_type'] ?? null, 'resource_id' => isset($context['resource_id']) ? (string) $context['resource_id'] : null,
            'before_state' => $context['before'] ?? null, 'after_state' => $context['after'] ?? null,
            'correlation_id' => $context['correlation_id'] ?? (string) Str::uuid(), 'success' => $context['success'] ?? true, 'failure_reason' => $context['failure_reason'] ?? null,
        ]);
    }
}
