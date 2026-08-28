<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AccessRequestService
{
    public function __construct(private readonly AuthorizationService $authz, private readonly SodService $sod, private readonly SecurityAuditService $audit) {}

    public function create(User $requester, int $organizationId, int $roleId, string $scope, ?array $scopeData, ?string $expiresAt): string
    {
        $this->authz->authorize($requester, $organizationId, 'access_request.create');
        if (! in_array($scope, AuthorizationService::SCOPES, true)) {
            abort(422, 'Invalid data scope.');
        }
        Role::query()->where('organization_id', $organizationId)->findOrFail($roleId);
        $membership = $this->authz->activeMembership($requester, $organizationId);
        if (! $membership) {
            abort(403, 'Active organization membership required.');
        }
        $id = (string) Str::uuid();
        DB::table('access_requests')->insert([
            'id' => $id, 'organization_id' => $organizationId, 'requester_user_id' => $requester->id, 'role_id' => $roleId,
            'scope' => $scope, 'scope_data' => $scopeData ? json_encode($scopeData) : null, 'status' => 'pending_manager',
            'expires_at' => $expiresAt, 'approvals' => json_encode([]), 'created_at' => now(), 'updated_at' => now(),
        ]);
        $this->audit->record('access_request.created', $requester, ['organization_id' => $organizationId, 'resource_type' => 'access_request', 'resource_id' => $id]);

        return $id;
    }

    public function approve(User $actor, int $organizationId, string $id): array
    {
        return DB::transaction(function () use ($actor, $organizationId, $id): array {
            $row = DB::table('access_requests')->where('organization_id', $organizationId)->where('id', $id)->lockForUpdate()->first();
            if (! $row) {
                abort(404, 'Access request not found.');
            }
            if (! str_starts_with((string) $row->status, 'pending_')) {
                abort(409, 'Access request is not awaiting approval.');
            }
            if ((int) $row->requester_user_id === (int) $actor->id) {
                abort(409, 'Self-approval is not allowed.');
            }
            $approvals = $row->approvals ? json_decode($row->approvals, true) : [];
            if (collect($approvals)->contains(fn ($a) => (int) ($a['user_id'] ?? 0) === (int) $actor->id)) {
                abort(409, 'The same approver cannot approve multiple access-request stages.');
            }

            $stage = (string) $row->status;
            $next = match ($stage) {
                'pending_manager' => 'pending_role_owner',
                'pending_role_owner' => 'pending_security',
                'pending_security' => 'provisioned',
                default => abort(409, 'Invalid access request stage.'),
            };
            $permission = match ($stage) {
                'pending_manager' => 'access_request.approve',
                'pending_role_owner' => 'role.assign',
                'pending_security' => 'security.manage',
            };
            $this->authz->authorize($actor, $organizationId, $permission);
            $approvals[] = ['stage' => $stage, 'user_id' => (int) $actor->id, 'at' => now()->toIso8601String()];

            $updates = ['status' => $next, 'approvals' => json_encode($approvals), 'updated_at' => now()];
            if ($stage === 'pending_manager') {
                $updates += ['manager_approved_by' => $actor->id, 'manager_approved_at' => now()];
            }
            if ($stage === 'pending_role_owner') {
                $updates += ['role_owner_approved_by' => $actor->id, 'role_owner_approved_at' => now()];
            }
            if ($stage === 'pending_security') {
                $updates += ['security_approved_by' => $actor->id, 'security_approved_at' => now(), 'provisioned_at' => now()];
                $target = User::findOrFail($row->requester_user_id);
                $rolePermissions = DB::table('role_permissions as rp')->join('permissions as p', 'p.id', '=', 'rp.permission_id')->where('rp.role_id', $row->role_id)->pluck('p.name')->all();
                $this->sod->assertNoConflict($target, $organizationId, $rolePermissions);
                $membership = $this->authz->activeMembership($target, $organizationId);
                if (! $membership) {
                    abort(409, 'Requester no longer has an active organization membership.');
                }
                DB::table('membership_role_assignments')->updateOrInsert(
                    ['organization_member_id' => $membership->id, 'role_id' => $row->role_id],
                    ['scope' => $row->scope, 'scope_data' => $row->scope_data, 'expires_at' => $row->expires_at, 'assigned_by' => $actor->id, 'reason' => 'Approved access request '.$id, 'updated_at' => now(), 'created_at' => now()],
                );
                $target->increment('authz_version');
                $this->audit->record('role.assigned', $actor, ['subject_user_id' => $target->id, 'organization_id' => $organizationId, 'resource_type' => 'access_request', 'resource_id' => $id]);
            }
            DB::table('access_requests')->where('id', $id)->update($updates);
            $this->audit->record('access_request.approved', $actor, ['organization_id' => $organizationId, 'resource_type' => 'access_request', 'resource_id' => $id, 'after' => ['stage' => $stage, 'status' => $next]]);

            return ['id' => $id, 'status' => $next, 'approvals' => $approvals];
        });
    }

    public function reject(User $actor, int $organizationId, string $id, string $reason): void
    {
        $this->authz->authorize($actor, $organizationId, 'access_request.approve');
        DB::transaction(function () use ($actor, $organizationId, $id, $reason): void {
            $row = DB::table('access_requests')->where('organization_id', $organizationId)->where('id', $id)->lockForUpdate()->first();
            if (! $row) {
                abort(404, 'Access request not found.');
            }
            if (! str_starts_with((string) $row->status, 'pending_')) {
                abort(409, 'Access request is not pending.');
            }
            if ((int) $row->requester_user_id === (int) $actor->id) {
                abort(409, 'Self-review is not allowed.');
            }
            DB::table('access_requests')->where('id', $id)->update(['status' => 'rejected', 'rejected_by' => $actor->id, 'rejected_at' => now(), 'rejection_reason' => $reason, 'updated_at' => now()]);
            $this->audit->record('access_request.rejected', $actor, ['organization_id' => $organizationId, 'resource_type' => 'access_request', 'resource_id' => $id, 'failure_reason' => $reason]);
        });
    }
}
