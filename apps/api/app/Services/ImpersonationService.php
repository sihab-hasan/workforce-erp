<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ImpersonationService
{
    public function __construct(private readonly SecurityAuditService $audit) {}

    public function start(Request $request, User $actor, int $subjectId, int $organizationId, string $ticket, string $reason, int $minutes, array $restrictedActions): array
    {
        if ((int) $actor->id === $subjectId) {
            abort(422, 'You cannot impersonate yourself.');
        }
        $subject = User::query()->where('status', 'active')->findOrFail($subjectId);
        if (! $subject->memberships()->where('organization_id', $organizationId)->where('status', 'active')->exists()) {
            abort(422, 'The target user does not have active access to this organization.');
        }
        $id = (string) Str::uuid();
        $expires = now()->addMinutes(max(5, min(60, $minutes)));
        DB::table('impersonation_sessions')->insert(['id' => $id, 'actor_user_id' => $actor->id, 'subject_user_id' => $subjectId, 'organization_id' => $organizationId, 'support_ticket' => $ticket, 'reason' => $reason, 'expires_at' => $expires, 'restricted_actions' => json_encode(array_values(array_unique($restrictedActions))), 'approved_by' => $actor->id, 'started_at' => now(), 'created_at' => now(), 'updated_at' => now()]);
        $request->session()->put(['impersonation_id' => $id, 'impersonation_subject_user_id' => $subjectId, 'impersonation_organization_id' => $organizationId]);
        $this->audit->record('impersonation.started', $actor, ['subject_user_id' => $subjectId, 'organization_id' => $organizationId, 'resource_type' => 'impersonation', 'resource_id' => $id]);

        return ['id' => $id, 'expires_at' => $expires->toIso8601String(), 'organization_id' => (string) $organizationId, 'subject_user_id' => (string) $subjectId, 'banner' => 'Support impersonation is active and every request is audited.'];
    }

    public function activeForActor(User $actor, ?string $id): ?object
    {
        if (! $id) {
            return null;
        }

        return DB::table('impersonation_sessions')->where('id', $id)->where('actor_user_id', $actor->id)->whereNull('ended_at')->where('expires_at', '>', now())->first();
    }

    public function end(Request $request, User $actor, string $id): void
    {
        $row = DB::table('impersonation_sessions')->where('id', $id)->where('actor_user_id', $actor->id)->whereNull('ended_at')->first();
        if (! $row) {
            abort(404, 'Active impersonation session not found.');
        }
        DB::table('impersonation_sessions')->where('id', $id)->update(['ended_at' => now(), 'updated_at' => now()]);
        if ($request->session()->get('impersonation_id') === $id) {
            $request->session()->forget(['impersonation_id', 'impersonation_subject_user_id', 'impersonation_organization_id']);
        }
        $this->audit->record('impersonation.ended', $actor, ['subject_user_id' => $row->subject_user_id, 'organization_id' => $row->organization_id, 'resource_type' => 'impersonation', 'resource_id' => $id]);
    }
}
