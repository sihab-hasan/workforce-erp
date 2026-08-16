<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;
use App\Models\UserSsoIdentity;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class UserService
{
    public const USER_ROLES = ['owner', 'admin', 'manager', 'staff', 'readonly'];

    public const USER_STATUSES = ['active', 'inactive', 'invited', 'suspended'];

    public const SORTABLE_FIELDS = ['name', 'email', 'created_at', 'last_login_at', 'role', 'status'];

    public function __construct(
        private readonly OrganizationAccessService $access,
        private readonly AuthService $authService,
    ) {}

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(User $actor, array $filters): LengthAwarePaginator
    {
        $this->assertCanAccessUsersArea($actor);
        $organizationIds = $this->access->organizationIds($actor, OrganizationAccessService::USER_MANAGER_ROLES);
        $query = User::query()->with($this->relationsForOrganizations($organizationIds));

        if ($organizationIds === []) {
            $query->whereRaw('1 = 0');
        } else {
            $query->whereHas('organizations', fn ($q) => $q->whereIn('organizations.id', $organizationIds));
        }

        if (! empty($filters['organization_id'])) {
            $organizationId = (int) $filters['organization_id'];
            $this->access->assertCanManage(
                $actor,
                $organizationId,
                OrganizationAccessService::USER_MANAGER_ROLES,
                'You do not have access to this organization.'
            );
            $query->whereHas('organizations', fn ($q) => $q->where('organizations.id', $organizationId));
            $organizationIds = [$organizationId];
        }

        if (! empty($filters['role']) && $filters['role'] !== 'all') {
            $role = $filters['role'];
            $query->whereHas('organizations', fn ($q) => $q
                ->whereIn('organizations.id', $organizationIds)
                ->where('organization_members.role', $role));
        }

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $status = $filters['status'];
            $query->whereHas('organizations', fn ($q) => $q
                ->whereIn('organizations.id', $organizationIds)
                ->where('organization_members.status', $status));
        }

        if (! empty($filters['search'])) {
            $search = trim((string) $filters['search']);
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        $sortBy = (string) ($filters['sort_by'] ?? 'name');
        $direction = ($filters['sort_direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        if (in_array($sortBy, ['role', 'status'], true)) {
            $query->orderBy(
                OrganizationMember::query()
                    ->select($sortBy)
                    ->whereColumn('organization_members.user_id', 'users.id')
                    ->whereIn('organization_members.organization_id', $organizationIds)
                    ->orderBy('organization_members.organization_id')
                    ->limit(1),
                $direction
            );
        } else {
            $query->orderBy($sortBy, $direction);
        }

        return $query->orderBy('users.id')->paginate((int) ($filters['per_page'] ?? 15));
    }

    public function accessible(User $actor, User $target): User
    {
        $organizationId = $this->sharedManagedOrganizationId($actor, $target);
        $target->load($this->relationsForOrganizations([$organizationId]));

        return $target;
    }

    /**
     * @param  array{name:string,email:string,role:string,organization_id?:int|null,employee_id?:int|null}  $data
     */
    public function invite(User $actor, array $data): User
    {
        $organizationId = $this->resolveManagedOrganizationId($actor, $data['organization_id'] ?? null);
        $this->assertCanManageUsers($actor, $organizationId);
        $this->assertAssignableRole($actor, $organizationId, $data['role']);

        $user = DB::transaction(function () use ($data, $organizationId) {
            $user = User::query()->where('email', $data['email'])->first();

            if ($user && $user->organizations()->where('organizations.id', $organizationId)->exists()) {
                abort(409, 'This user already belongs to the selected organization.');
            }

            if (! $user) {
                $user = User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => Hash::make(Str::random(48)),
                ]);
            }

            $user->organizations()->attach($organizationId, [
                'role' => $data['role'],
                'status' => 'invited',
            ]);

            if (! empty($data['employee_id'])) {
                $this->linkEmployee($user, $organizationId, (int) $data['employee_id']);
            }

            return $user;
        });

        $user->setAttribute('invitation_delivered', $this->sendInvitation($user));
        $user->load($this->relationsForOrganizations([$organizationId]));

        return $user;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(User $actor, User $target, array $data): User
    {
        $organizationId = isset($data['organization_id']) && $data['organization_id'] !== null
            ? (int) $data['organization_id']
            : $this->sharedManagedOrganizationId($actor, $target);

        $this->assertCanManageUsers($actor, $organizationId);

        if (! $target->organizations()->where('organizations.id', $organizationId)->exists()) {
            throw new AuthorizationException('The selected user does not belong to this organization.');
        }

        $this->assertCanManageTarget($actor, $target, $organizationId);

        if (array_key_exists('role', $data)) {
            $this->assertAssignableRole($actor, $organizationId, $data['role']);
            $this->assertOwnerContinuity($target, $organizationId, $data['role'], null);
        }

        $emailChanged = array_key_exists('email', $data) && $data['email'] !== $target->email;

        if ($emailChanged) {
            $this->assertEmailChangeSafe($target, $organizationId);
        }

        DB::transaction(function () use ($data, $organizationId, $target) {
            $accountChanges = [];

            if (array_key_exists('name', $data)) {
                $accountChanges['name'] = $data['name'];
            }

            if (array_key_exists('email', $data) && $data['email'] !== $target->email) {
                $accountChanges['email'] = $data['email'];
                $accountChanges['email_verified_at'] = null;
            }

            if ($accountChanges !== []) {
                $target->forceFill($accountChanges)->save();
            }

            if (array_key_exists('role', $data)) {
                $target->organizations()->updateExistingPivot($organizationId, ['role' => $data['role']]);
            }

            if (array_key_exists('employee_id', $data)) {
                Employee::query()
                    ->where('organization_id', $organizationId)
                    ->where('user_id', $target->id)
                    ->update(['user_id' => null]);

                if ($data['employee_id']) {
                    $this->linkEmployee($target, $organizationId, (int) $data['employee_id']);
                }
            }
        });

        if ($emailChanged) {
            // Email is the login identity. Remove provider bindings tied to the old
            // email so the newly verified Google/Microsoft identity can be linked.
            UserSsoIdentity::query()->where('user_id', $target->id)->delete();
            $target->forceFill(['sso_provider' => null, 'sso_provider_id' => null])->save();

            // Existing API/browser credentials should not survive an identity change.
            $target->tokens()->delete();
            $this->authService->revokeAllBrowserSessions($target);
        }

        $target->load($this->relationsForOrganizations([$organizationId]));

        return $target;
    }

    public function setStatus(User $actor, User $target, string $status, ?int $requestedOrganizationId = null): User
    {
        if (! in_array($status, self::USER_STATUSES, true)) {
            abort(422, 'Unsupported user status.');
        }

        $organizationId = $this->managedTargetOrganizationId($actor, $target, $requestedOrganizationId);
        $this->assertCanManageUsers($actor, $organizationId);
        $this->assertCanManageTarget($actor, $target, $organizationId);
        $this->assertOwnerContinuity($target, $organizationId, null, $status);

        $target->organizations()->updateExistingPivot($organizationId, ['status' => $status]);

        if ($status !== 'active' && ! $target->memberships()->where('status', 'active')->exists()) {
            $target->tokens()->delete();
            $this->authService->revokeAllBrowserSessions($target);
        }

        $target->load($this->relationsForOrganizations([$organizationId]));

        return $target;
    }

    /**
     * @return array{delivered:bool,sent_at:?string}
     */
    public function resendInvitation(User $actor, User $target, ?int $requestedOrganizationId = null): array
    {
        $organizationId = $this->managedTargetOrganizationId($actor, $target, $requestedOrganizationId);
        $this->assertCanManageUsers($actor, $organizationId);
        $this->assertCanManageTarget($actor, $target, $organizationId);

        $membershipStatus = $target->memberships()
            ->where('organization_id', $organizationId)
            ->value('status');

        if ($membershipStatus !== 'invited') {
            abort(409, 'Only invited accounts can receive an invitation again.');
        }

        $delivered = $this->sendInvitation($target);

        return [
            'delivered' => $delivered,
            'sent_at' => $delivered ? now()->toIso8601String() : null,
        ];
    }

    /**
     * Hard deletion is deliberately unsupported because account identifiers are
     * referenced by audit/history records. Deactivation preserves referential history.
     */
    public function rejectUnsafeDeletion(User $actor, User $target): never
    {
        $organizationId = $this->sharedManagedOrganizationId($actor, $target);
        $this->assertCanManageUsers($actor, $organizationId);
        $this->assertCanManageTarget($actor, $target, $organizationId);

        abort(409, 'User accounts cannot be permanently deleted. Deactivate the account to preserve audit and history data.');
    }

    /**
     * @return Collection<int, array{id:string,name:string,slug:string}>
     */
    public function organizationOptions(User $actor): Collection
    {
        $this->assertCanAccessUsersArea($actor);

        return Organization::query()
            ->whereIn('id', $this->access->organizationIds($actor, OrganizationAccessService::USER_MANAGER_ROLES))
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn (Organization $organization) => [
                'id' => (string) $organization->id,
                'name' => $organization->name,
                'slug' => $organization->slug,
            ]);
    }

    /**
     * @return Collection<int, array{id:string,name:string,slug:string,description:string}>
     */
    public function roleOptions(User $actor): Collection
    {
        $this->assertCanAccessUsersArea($actor);
        $actorCanAssignOwner = collect($this->access->organizationIds($actor, ['owner']))->isNotEmpty();

        return collect(self::USER_ROLES)
            ->filter(fn (string $role) => $role !== 'owner' || $actorCanAssignOwner)
            ->values()
            ->map(fn (string $role) => [
                'id' => $role,
                'name' => Str::headline($role),
                'slug' => $role,
                'description' => match ($role) {
                    'owner' => 'Full organization control, including owner assignment.',
                    'admin' => 'Manage users and organization administration.',
                    'manager' => 'Manage operational teams and approved workflows.',
                    'staff' => 'Standard workforce application access.',
                    'readonly' => 'View-only access to permitted areas.',
                },
            ]);
    }

    /**
     * @return Collection<int, array{id:string,name:string,department:?string,designation:?string,email:string,linked_user_id:?string}>
     */
    public function employeeOptions(User $actor): Collection
    {
        $this->assertCanAccessUsersArea($actor);
        $organizationIds = $this->access->organizationIds($actor, OrganizationAccessService::USER_MANAGER_ROLES);

        return Employee::query()
            ->with(['department', 'designation'])
            ->whereIn('organization_id', $organizationIds)
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get()
            ->map(fn (Employee $employee) => [
                'id' => (string) $employee->id,
                'name' => $employee->name,
                'department' => $employee->department?->name,
                'designation' => $employee->designation?->name,
                'email' => $employee->email,
                'linked_user_id' => $employee->user_id ? (string) $employee->user_id : null,
            ]);
    }

    private function assertCanAccessUsersArea(User $actor): void
    {
        $this->access->assertCanManageAny(
            $actor,
            OrganizationAccessService::USER_MANAGER_ROLES,
            'You do not have permission to access Users & Access.'
        );
    }

    private function resolveManagedOrganizationId(User $actor, mixed $requestedOrganizationId): int
    {
        if ($requestedOrganizationId !== null && $requestedOrganizationId !== '') {
            return (int) $requestedOrganizationId;
        }

        $organizationId = $this->access->organizationIds(
            $actor,
            OrganizationAccessService::USER_MANAGER_ROLES
        )[0] ?? 0;

        if ($organizationId === 0) {
            throw new AuthorizationException('You do not have an organization where users can be managed.');
        }

        return $organizationId;
    }

    private function managedTargetOrganizationId(User $actor, User $target, ?int $requestedOrganizationId): int
    {
        if ($requestedOrganizationId === null) {
            return $this->sharedManagedOrganizationId($actor, $target);
        }

        $this->assertCanManageUsers($actor, $requestedOrganizationId);

        if (! $target->memberships()->where('organization_id', $requestedOrganizationId)->exists()) {
            throw new AuthorizationException('The selected user does not belong to this organization.');
        }

        return $requestedOrganizationId;
    }

    private function sharedManagedOrganizationId(User $actor, User $target): int
    {
        $organizationId = $this->access->firstSharedOrganizationId(
            $actor,
            $target,
            OrganizationAccessService::USER_MANAGER_ROLES
        );

        if ($organizationId === 0) {
            throw new AuthorizationException('You do not have access to this user.');
        }

        return $organizationId;
    }

    private function assertCanManageUsers(User $actor, int $organizationId): void
    {
        $this->access->assertCanManage(
            $actor,
            $organizationId,
            OrganizationAccessService::USER_MANAGER_ROLES,
            'You do not have permission to manage users in this organization.'
        );
    }

    private function assertAssignableRole(User $actor, int $organizationId, string $role): void
    {
        if ($role === 'owner' && $this->access->activeRole($actor, $organizationId) !== 'owner') {
            throw new AuthorizationException('Only an organization owner can assign the owner role.');
        }
    }

    private function assertCanManageTarget(User $actor, User $target, int $organizationId): void
    {
        $targetRole = $target->memberships()
            ->where('organization_id', $organizationId)
            ->value('role');

        if ($targetRole === 'owner' && $this->access->activeRole($actor, $organizationId) !== 'owner') {
            throw new AuthorizationException('Only an organization owner can modify another owner.');
        }
    }

    private function assertEmailChangeSafe(User $target, int $organizationId): void
    {
        $belongsElsewhere = $target->memberships()
            ->where('organization_id', '!=', $organizationId)
            ->exists();

        if ($belongsElsewhere) {
            abort(409, 'This account belongs to multiple organizations. Change its global login email through a dedicated identity-administration workflow.');
        }
    }

    private function assertOwnerContinuity(
        User $target,
        int $organizationId,
        ?string $newRole,
        ?string $newStatus
    ): void {
        $membership = $target->memberships()
            ->where('organization_id', $organizationId)
            ->first();

        if (! $membership || $membership->role !== 'owner' || $membership->status !== 'active') {
            return;
        }

        $removesActiveOwner = ($newRole !== null && $newRole !== 'owner')
            || ($newStatus !== null && $newStatus !== 'active');

        if (! $removesActiveOwner) {
            return;
        }

        $otherActiveOwnerExists = OrganizationMember::query()
            ->where('organization_id', $organizationId)
            ->where('role', 'owner')
            ->where('status', 'active')
            ->where('user_id', '!=', $target->id)
            ->exists();

        if (! $otherActiveOwnerExists) {
            abort(409, 'The organization must retain at least one active owner.');
        }
    }

    private function linkEmployee(User $user, int $organizationId, int $employeeId): void
    {
        $employee = Employee::query()
            ->where('organization_id', $organizationId)
            ->findOrFail($employeeId);

        if ($employee->user_id && (int) $employee->user_id !== (int) $user->id) {
            abort(409, 'This employee is already linked to another user.');
        }

        $otherEmployeeForUser = Employee::query()
            ->where('organization_id', $organizationId)
            ->where('user_id', $user->id)
            ->where('id', '!=', $employee->id)
            ->exists();

        if ($otherEmployeeForUser) {
            abort(409, 'This user is already linked to another employee in the selected organization.');
        }

        $employee->update(['user_id' => $user->id]);
    }

    private function sendInvitation(User $user): bool
    {
        try {
            $portalUrl = rtrim((string) config('workforce.portal_url'), '/');
            $activationUrl = $portalUrl.'/auth/mfa?'.http_build_query([
                'email' => $user->email,
            ]);

            Mail::raw(
                "You have been invited to Workforce ERP. Open {$activationUrl} and request a one-time code to activate your account.",
                fn ($message) => $message->to($user->email)->subject('Workforce ERP invitation')
            );

            return true;
        } catch (\Throwable $exception) {
            Log::warning('User invitation email could not be sent.', [
                'user_id' => $user->id,
                'exception' => $exception::class,
            ]);

            return false;
        }
    }

    /**
     * @param  array<int, int>  $organizationIds
     * @return array<string, \Closure>
     */
    private function relationsForOrganizations(array $organizationIds): array
    {
        return [
            'organizations' => fn ($query) => $query->whereIn('organizations.id', $organizationIds),
            'employees' => fn ($query) => $query
                ->whereIn('organization_id', $organizationIds)
                ->with(['department', 'designation']),
        ];
    }
}
