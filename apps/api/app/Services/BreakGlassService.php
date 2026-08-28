<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BreakGlassService
{
    public function __construct(private readonly SecurityAuditService $audit) {}

    public function start(User $user, ?int $organizationId, string $reason, int $minutes, ?int $approvedBy = null): array
    {
        if ($minutes < 5 || $minutes > (int) config('security.break_glass.max_minutes', 60)) {
            abort(422, 'Invalid break-glass duration.');
        }
        $id = (string) Str::uuid();
        $expires = now()->addMinutes($minutes);
        DB::table('break_glass_grants')->insert(['id' => $id, 'user_id' => $user->id, 'organization_id' => $organizationId, 'reason' => $reason, 'starts_at' => now(), 'expires_at' => $expires, 'approved_by' => $approvedBy, 'status' => 'active', 'notification_sent_at' => now(), 'created_at' => now(), 'updated_at' => now()]);
        $this->audit->record('break_glass.started', $user, ['organization_id' => $organizationId, 'resource_type' => 'break_glass', 'resource_id' => $id]);

        return ['id' => $id, 'expires_at' => $expires->toIso8601String(), 'status' => 'active'];
    }

    public function activeGrant(User $user, ?int $organizationId = null): ?object
    {
        return DB::table('break_glass_grants')->where('user_id', $user->id)->where('status', 'active')->whereNull('ended_at')->where('starts_at', '<=', now())->where('expires_at', '>', now())
            ->when($organizationId !== null, fn ($q) => $q->where(fn ($x) => $x->whereNull('organization_id')->orWhere('organization_id', $organizationId)))
            ->when($organizationId === null, fn ($q) => $q->whereNull('organization_id'))->orderByDesc('starts_at')->first();
    }

    public function allowsTenant(User $user, int $organizationId, string $permission): bool
    {
        return $this->activeGrant($user, $organizationId) && in_array($permission, (array) config('security.break_glass.tenant_permissions', []), true);
    }

    public function allowsPlatform(User $user, string $permission): bool
    {
        return $this->activeGrant($user, null) && in_array($permission, (array) config('security.break_glass.platform_permissions', []), true);
    }

    public function auditUse(User $user, ?int $organizationId, string $permission): void
    {
        $grant = $this->activeGrant($user, $organizationId);
        if (! $grant) {
            return;
        }
        $this->audit->record('break_glass.used', $user, ['organization_id' => $organizationId, 'resource_type' => 'break_glass', 'resource_id' => $grant->id, 'after' => ['permission' => $permission]]);
    }

    public function end(User $actor, string $id): void
    {
        $row = DB::table('break_glass_grants')->where('id', $id)->where('user_id', $actor->id)->whereNull('ended_at')->first();
        if (! $row) {
            abort(404, 'Active break-glass grant not found.');
        }
        DB::table('break_glass_grants')->where('id', $id)->update(['ended_at' => now(), 'status' => 'ended', 'updated_at' => now()]);
        $this->audit->record('break_glass.ended', $actor, ['organization_id' => $row->organization_id, 'resource_type' => 'break_glass', 'resource_id' => $id]);
    }

    public function review(User $reviewer, string $id, string $note): void
    {
        $row = DB::table('break_glass_grants')->where('id', $id)->first();
        if (! $row) {
            abort(404, 'Break-glass grant not found.');
        }if ((int) $row->user_id === (int) $reviewer->id) {
            abort(409, 'Break-glass post-event review must be performed by another user.');
        }
        DB::table('break_glass_grants')->where('id', $id)->update(['reviewed_at' => now(), 'reviewed_by' => $reviewer->id, 'review_note' => $note, 'updated_at' => now()]);
        $this->audit->record('break_glass.reviewed', $reviewer, ['subject_user_id' => $row->user_id, 'organization_id' => $row->organization_id, 'resource_type' => 'break_glass', 'resource_id' => $id]);
    }
}
