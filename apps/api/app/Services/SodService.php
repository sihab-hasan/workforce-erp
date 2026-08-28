<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class SodService
{
    public function __construct(private readonly AuthorizationService $authorization, private readonly SecurityAuditService $audit) {}

    public function conflicts(User $user, int $orgId, array $newPermissions = []): array
    {
        $effective = array_values(array_unique(array_merge($this->authorization->permissions($user, $orgId), $newPermissions)));
        $rules = DB::table('sod_rules')->where('is_active', true)->where(fn ($q) => $q->whereNull('organization_id')->orWhere('organization_id', $orgId))->get();
        $conflicts = [];
        foreach ($rules as $r) {
            if (! in_array($r->permission_a, $effective, true) || ! in_array($r->permission_b, $effective, true)) {
                continue;
            }$override = DB::table('sod_overrides')->where('sod_rule_id', $r->id)->where('user_id', $user->id)->whereNull('revoked_at')->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))->first();
            $conflicts[] = ['rule_id' => (int) $r->id, 'permission_a' => $r->permission_a, 'permission_b' => $r->permission_b, 'control_type' => $r->control_type, 'severity' => $r->severity ?? 'high', 'override' => (bool) $override];
        }

        return $conflicts;
    }

    public function assertNoConflict(User $user, int $orgId, array $newPermissions): void
    {
        foreach ($this->conflicts($user, $orgId, $newPermissions) as $c) {
            if ($c['override']) {
                continue;
            }$this->audit->record('sod.conflict', $user, ['subject_user_id' => $user->id, 'organization_id' => $orgId, 'success' => $c['control_type'] === 'detective', 'failure_reason' => $c['permission_a'].' x '.$c['permission_b']]);
            if ($c['control_type'] === 'preventive') {
                abort(409, 'The requested access conflicts with segregation-of-duties policy.');
            }
        }
    }

    public function permissionSetConflicts(int $orgId, array $permissions): array
    {
        $effective = array_values(array_unique($permissions));
        $rules = DB::table('sod_rules')->where('is_active', true)->where(fn ($q) => $q->whereNull('organization_id')->orWhere('organization_id', $orgId))->get();
        $out = [];
        foreach ($rules as $r) {
            if (in_array($r->permission_a, $effective, true) && in_array($r->permission_b, $effective, true)) {
                $out[] = ['rule_id' => (int) $r->id, 'permission_a' => $r->permission_a, 'permission_b' => $r->permission_b, 'control_type' => $r->control_type, 'severity' => $r->severity ?? 'high'];
            }
        }

        return $out;
    }

    public function assertPermissionSet(int $orgId, array $permissions): void
    {
        foreach ($this->permissionSetConflicts($orgId, $permissions) as $c) {
            if ($c['control_type'] === 'preventive') {
                abort(409, 'The selected permissions conflict with segregation-of-duties policy: '.$c['permission_a'].' x '.$c['permission_b']);
            }
        }
    }

    public function createOverride(User $actor, int $orgId, int $ruleId, User $target, string $mitigation, string $reason, ?string $expiresAt): int
    {
        $this->authorization->authorize($actor, $orgId, 'security.manage');
        if ((int) $actor->id === (int) $target->id) {
            abort(409, 'SoD override self-approval is not allowed.');
        }$rule = DB::table('sod_rules')->where('id', $ruleId)->where('is_active', true)->where(fn ($q) => $q->whereNull('organization_id')->orWhere('organization_id', $orgId))->first();
        if (! $rule) {
            abort(404, 'SoD rule not found.');
        }$id = DB::table('sod_overrides')->insertGetId(['sod_rule_id' => $ruleId, 'user_id' => $target->id, 'approved_by' => $actor->id, 'mitigation' => $mitigation, 'reason' => $reason, 'expires_at' => $expiresAt, 'created_at' => now(), 'updated_at' => now()]);
        $this->audit->record('sod.override', $actor, ['subject_user_id' => $target->id, 'organization_id' => $orgId, 'resource_type' => 'sod_override', 'resource_id' => $id]);

        return $id;
    }

    public function revokeOverride(User $actor, int $orgId, int $id): void
    {
        $this->authorization->authorize($actor, $orgId, 'security.manage');
        $row = DB::table('sod_overrides as o')->join('sod_rules as r', 'r.id', '=', 'o.sod_rule_id')->where('o.id', $id)->where(fn ($q) => $q->whereNull('r.organization_id')->orWhere('r.organization_id', $orgId))->select('o.*')->first();
        if (! $row) {
            abort(404, 'SoD override not found.');
        }DB::table('sod_overrides')->where('id', $id)->update(['revoked_at' => now(), 'updated_at' => now()]);
        $this->audit->record('sod.override.revoked', $actor, ['subject_user_id' => $row->user_id, 'organization_id' => $orgId, 'resource_type' => 'sod_override', 'resource_id' => $id]);
    }

    public function seedDefaults(): void
    {
        foreach ([['vendor.create', 'vendor.approve'], ['purchase.create', 'purchase.approve'], ['payroll.prepare', 'payroll.approve'], ['journal.create', 'journal.post'], ['refund.create', 'refund.approve']] as [$a,$b]) {
            DB::table('sod_rules')->updateOrInsert(['organization_id' => null, 'permission_a' => $a, 'permission_b' => $b], ['control_type' => 'preventive', 'severity' => 'high', 'mitigation_required' => true, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        }
    }
}
