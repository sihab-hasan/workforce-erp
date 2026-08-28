<?php

namespace App\Services;

use App\Mail\OrganizationInvitationMail;
use App\Models\OrganizationInvitation;
use App\Models\OrganizationMember;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class InvitationService
{
    public function __construct(private readonly AuthorizationService $authorization, private readonly SecurityAuditService $audit) {}

    public function issue(User $actor, int $organizationId, string $email, array $roleNames, string $scope = 'OWN', ?array $scopeData = null, ?string $name = null): array
    {
        $this->authorization->authorize($actor, $organizationId, 'user.invite');
        $email = Str::lower(trim($email));
        $user = User::query()->where('email', $email)->first();
        if (! $user) {
            $user = User::query()->create(['name' => $name ?: $email, 'email' => $email, 'password' => Hash::make(Str::random(64)), 'status' => 'active']);
        }
        $membership = OrganizationMember::query()->firstOrCreate(['organization_id' => $organizationId, 'user_id' => $user->id], ['role' => 'invited', 'status' => 'invited', 'data_scope' => $scope, 'scope_data' => $scopeData]);
        if ($membership->status === 'active') {
            abort(409, 'This user already belongs to the organization.');
        }
        $roleIds = Role::query()->where('organization_id', $organizationId)->whereIn('name', $roleNames)->pluck('id')->all();
        if (count($roleIds) !== count(array_unique($roleNames))) {
            abort(422, 'One or more roles are invalid for this organization.');
        }
        OrganizationInvitation::query()->where('organization_member_id', $membership->id)->whereNull('accepted_at')->whereNull('revoked_at')->update(['revoked_at' => now()]);
        $token = Str::random(64);
        $inv = OrganizationInvitation::query()->create(['organization_id' => $organizationId, 'organization_member_id' => $membership->id, 'invited_by' => $actor->id, 'email' => $email, 'token_hash' => hash('sha256', $token), 'role_ids' => $roleIds, 'data_scope' => $scope, 'scope_data' => $scopeData, 'expires_at' => now()->addHours((int) config('security.invitation.ttl_hours', 72))]);
        $url = rtrim((string) config('workforce.portal_url'), '/').'/accept-invitation/'.rawurlencode($token);
        $delivered = true;
        try {
            Mail::to($email)->send(new OrganizationInvitationMail($inv->organization->name, $url, $inv->expires_at->toIso8601String()));
        } catch (\Throwable $e) {
            $delivered = false;
            Log::warning('Organization invitation could not be delivered.', ['invitation_id' => $inv->id, 'exception' => $e::class]);
        } $this->audit->record('user.invited', $actor, ['subject_user_id' => $user->id, 'organization_id' => $organizationId, 'success' => $delivered, 'failure_reason' => $delivered ? null : 'delivery_failed']);

        return ['invitation' => $inv, 'delivered' => $delivered];
    }

    public function preview(string $token): OrganizationInvitation
    {
        $inv = OrganizationInvitation::query()->with(['organization', 'membership.user'])->where('token_hash', hash('sha256', $token))->first();
        if (! $inv || $inv->revoked_at || $inv->accepted_at || now()->gte($inv->expires_at)) {
            abort(404, 'Invitation is invalid or expired.');
        }

        return $inv;
    }

    public function accept(string $token, User $user): OrganizationMember
    {
        $inv = $this->preview($token);
        if (! hash_equals(Str::lower($inv->email), Str::lower($user->email))) {
            abort(403, 'This invitation belongs to a different email address.');
        } if ((int) $inv->membership->user_id !== (int) $user->id) {
            abort(403, 'This invitation is bound to a different identity.');
        }

        return DB::transaction(function () use ($inv, $user) {
            $inv = OrganizationInvitation::query()->lockForUpdate()->findOrFail($inv->id);
            if ($inv->accepted_at || $inv->revoked_at || now()->gte($inv->expires_at)) {
                abort(409, 'Invitation is no longer available.');
            } $membership = OrganizationMember::query()->lockForUpdate()->findOrFail($inv->organization_member_id);
            if ((int) $membership->organization_id !== (int) $inv->organization_id || (int) $membership->user_id !== (int) $user->id) {
                abort(409, 'Invitation membership binding is invalid.');
            }
            $membership->forceFill(['status' => 'active', 'data_scope' => $inv->data_scope, 'scope_data' => $inv->scope_data, 'activated_at' => now(), 'role' => 'assigned'])->save();
            $membership->roleAssignments()->delete();
            foreach ($inv->role_ids as $roleId) {
                $membership->roleAssignments()->create(['role_id' => $roleId, 'scope' => $inv->data_scope, 'scope_data' => $inv->scope_data, 'assigned_by' => $inv->invited_by, 'reason' => 'Accepted organization invitation']);
            } $inv->forceFill(['accepted_at' => now()])->save();
            $user->increment('authz_version');
            $this->audit->record('invitation.accepted', $user, ['subject_user_id' => $user->id, 'organization_id' => $inv->organization_id]);

            return $membership->fresh('organization');
        });
    }
}
