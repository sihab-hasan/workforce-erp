<?php

namespace Tests\Feature;

use App\Events\NotificationBroadcast;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\Organization;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkforceNotification;
use App\Notifications\LeaveRequestReviewed;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class NotificationApiTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;

    private LeaveType $leaveType;

    protected function setUp(): void
    {
        parent::setUp();

        $this->organization = Organization::create(['name' => 'Acme', 'slug' => 'acme']);
        $this->leaveType = LeaveType::create([
            'organization_id' => $this->organization->id,
            'name' => 'Annual Leave',
            'code' => 'ANNUAL',
            'annual_allowance' => 10,
            'is_paid' => true,
            'is_active' => true,
        ]);

        Event::fake([NotificationBroadcast::class]);
    }

    private function juneMonday(): Carbon
    {
        return Carbon::create(now()->year, 6, 1)->startOfWeek();
    }

    private function createUser(string $email, string $role = 'staff'): User
    {
        $user = User::create([
            'name' => explode('@', $email)[0],
            'email' => $email,
            'password' => Hash::make('password'),
        ]);
        $this->organization->members()->attach($user->id, ['role' => $role, 'status' => 'active']);

        return $user;
    }

    private function createEmployee(?User $user = null, string $code = 'EMP-001'): Employee
    {
        return Employee::create([
            'organization_id' => $this->organization->id,
            'user_id' => $user?->id,
            'employee_id' => $code,
            'first_name' => 'Test',
            'last_name' => 'Employee',
            'email' => $user?->email ?? strtolower($code).'@example.com',
            'hire_date' => '2026-01-01',
            'status' => 'active',
            'employment_type' => 'full-time',
        ]);
    }

    private function createLeaveRecord(Employee $employee, array $overrides = []): LeaveRequest
    {
        $monday = $this->juneMonday();

        return LeaveRequest::create(array_merge([
            'organization_id' => $this->organization->id,
            'employee_id' => $employee->id,
            'leave_type_id' => $this->leaveType->id,
            'start_date' => $monday->toDateString(),
            'end_date' => $monday->copy()->addDays(2)->toDateString(),
            'total_days' => 3,
            'status' => 'pending',
        ], $overrides));
    }

    private function headers(User $user): array
    {
        return ['Authorization' => 'Bearer '.$user->createToken('test')->plainTextToken];
    }

    /**
     * Attaches an explicit role assignment. NotificationAudience only resolves
     * recipients from role assignments, mirroring the pre-existing leave flow.
     */
    private function grantPermission(User $user, string $permission, string $roleName): void
    {
        $member = DB::table('organization_members')
            ->where('organization_id', $this->organization->id)
            ->where('user_id', $user->id)
            ->first();

        $role = Role::create(['organization_id' => $this->organization->id, 'name' => $roleName]);
        $role->permissions()->attach(Permission::query()->where('name', $permission)->firstOrFail()->id);

        DB::table('membership_role_assignments')->insert([
            'organization_member_id' => $member->id,
            'role_id' => $role->id,
            'scope' => 'ORGANIZATION',
            'scope_data' => null,
            'starts_at' => null,
            'expires_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function test_workforce_channel_stores_the_notification_and_broadcasts_it(): void
    {
        $user = $this->createUser('owner@example.com', 'owner');
        $employee = $this->createEmployee($user);
        $leave = $this->createLeaveRecord($employee);

        $user->notify(new LeaveRequestReviewed($leave, 'approved'));

        $this->assertDatabaseHas('workforce_notifications', [
            'organization_id' => $this->organization->id,
            'user_id' => $user->id,
            'type' => 'leave.approved',
            'title' => 'Leave request Approved',
            'action_url' => '/leave/'.$leave->id,
        ]);

        Event::assertDispatched(
            NotificationBroadcast::class,
            fn (NotificationBroadcast $event) => $event->notification->user_id === $user->id
                && $event->notification->type === 'leave.approved'
        );
    }

    public function test_broadcast_uses_the_existing_private_user_channel_and_event_name(): void
    {
        $user = $this->createUser('owner@example.com', 'owner');
        $record = WorkforceNotification::create([
            'organization_id' => $this->organization->id,
            'user_id' => $user->id,
            'type' => 'leave.approved',
            'title' => 'Leave request Approved',
            'message' => 'Your leave request was approved.',
            'action_url' => '/leave/1',
            'data' => ['status' => 'approved'],
        ]);

        $event = new NotificationBroadcast($record);
        $channels = array_map(fn ($channel) => $channel->name, $event->broadcastOn());

        $this->assertSame(['private-App.Models.User.'.$user->id], $channels);
        $this->assertSame('notification.created', $event->broadcastAs());
    }

    public function test_broadcast_payload_matches_the_rest_notification_shape(): void
    {
        $user = $this->createUser('owner@example.com', 'owner');
        $record = WorkforceNotification::create([
            'organization_id' => $this->organization->id,
            'user_id' => $user->id,
            'type' => 'document.shared',
            'title' => 'New office document shared',
            'message' => 'Policy uploaded.',
            'action_url' => '/documents',
            'data' => ['document_id' => '7'],
        ]);

        $payload = (new NotificationBroadcast($record))->broadcastWith()['notification'];

        $this->assertSame(
            ['id', 'type', 'title', 'message', 'action_url', 'data', 'read_at', 'is_read', 'created_at'],
            array_keys($payload)
        );
        $this->assertSame((string) $record->id, $payload['id']);
        $this->assertFalse($payload['is_read']);
        $this->assertNull($payload['read_at']);
        $this->assertSame(['document_id' => '7'], $payload['data']);
    }

    public function test_approving_a_leave_notifies_the_requester(): void
    {
        $requester = $this->createUser('requester@example.com');
        $employee = $this->createEmployee($requester);
        $leave = $this->createLeaveRecord($employee);
        $reviewer = $this->createUser('reviewer@example.com', 'owner');

        $this->withHeaders($this->headers($reviewer))
            ->patchJson("/api/v1/leave-requests/{$leave->id}/approve", ['review_note' => 'Enjoy'])
            ->assertOk();

        $this->assertDatabaseHas('workforce_notifications', [
            'user_id' => $requester->id,
            'type' => 'leave.approved',
            'title' => 'Leave request Approved',
            'message' => 'Your leave request from '.$leave->start_date->toDateString().' to '.$leave->end_date->toDateString().' was approved.',
            'action_url' => '/leave/'.$leave->id,
        ]);
        $this->assertDatabaseMissing('workforce_notifications', ['user_id' => $reviewer->id]);
    }

    public function test_rejecting_a_leave_stores_the_rejected_type(): void
    {
        $requester = $this->createUser('requester@example.com');
        $employee = $this->createEmployee($requester);
        $leave = $this->createLeaveRecord($employee);
        $reviewer = $this->createUser('reviewer@example.com', 'owner');

        $this->withHeaders($this->headers($reviewer))
            ->patchJson("/api/v1/leave-requests/{$leave->id}/reject")
            ->assertOk();

        $this->assertDatabaseHas('workforce_notifications', [
            'user_id' => $requester->id,
            'type' => 'leave.rejected',
            'title' => 'Leave request Rejected',
        ]);
    }

    public function test_submitting_a_leave_notifies_reviewers_assigned_the_approve_permission(): void
    {
        $requester = $this->createUser('requester@example.com');
        $employee = $this->createEmployee($requester);
        $reviewer = $this->createUser('reviewer@example.com');
        $this->grantPermission($reviewer, 'leave.approve', 'leave_reviewer');
        $bystander = $this->createUser('bystander@example.com');

        $monday = $this->juneMonday();
        $this->withHeaders($this->headers($requester))->postJson('/api/v1/leave-requests', [
            'leave_type_id' => $this->leaveType->id,
            'start_date' => $monday->toDateString(),
            'end_date' => $monday->copy()->addDays(1)->toDateString(),
            'reason' => 'Family event',
        ])->assertStatus(201);

        $this->assertDatabaseHas('workforce_notifications', [
            'user_id' => $reviewer->id,
            'type' => 'leave.requested',
            'title' => 'Leave approval required',
            'message' => $employee->name.' submitted a leave request.',
            'action_url' => '/approvals',
        ]);
        $this->assertDatabaseMissing('workforce_notifications', ['user_id' => $bystander->id]);
        $this->assertDatabaseMissing('workforce_notifications', ['user_id' => $requester->id]);
    }

    public function test_uploading_a_document_notifies_members_assigned_document_view(): void
    {
        Storage::fake('local');
        $uploader = $this->createUser('uploader@example.com', 'owner');
        $viewer = $this->createUser('viewer@example.com');
        $this->grantPermission($viewer, 'document.view', 'document_viewer');

        $response = $this->withHeaders($this->headers($uploader))->postJson('/api/v1/documents', [
            'file' => UploadedFile::fake()->create('policy.pdf', 1, 'application/pdf'),
            'name' => 'Office Policy',
            'category' => 'policy',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('workforce_notifications', [
            'user_id' => $viewer->id,
            'type' => 'document.shared',
            'title' => 'New office document shared',
            'message' => 'uploader shared "Office Policy".',
            'action_url' => '/documents',
        ]);
        $this->assertDatabaseMissing('workforce_notifications', ['user_id' => $uploader->id]);
        $this->assertSame(1, WorkforceNotification::query()->where('type', 'document.shared')->count());
    }

    public function test_unread_count_ignores_read_notifications_and_other_organizations(): void
    {
        $user = $this->createUser('owner@example.com', 'owner');
        $otherOrg = Organization::create(['name' => 'Other', 'slug' => 'other']);

        WorkforceNotification::create(['user_id' => $user->id, 'type' => 'info', 'title' => 'Global one']);
        WorkforceNotification::create([
            'organization_id' => $this->organization->id, 'user_id' => $user->id,
            'type' => 'info', 'title' => 'Unread here',
        ]);
        WorkforceNotification::create([
            'organization_id' => $this->organization->id, 'user_id' => $user->id,
            'type' => 'info', 'title' => 'Already read', 'read_at' => now(),
        ]);
        WorkforceNotification::create([
            'organization_id' => $otherOrg->id, 'user_id' => $user->id,
            'type' => 'info', 'title' => 'Other tenant',
        ]);

        $this->withHeaders($this->headers($user))
            ->getJson('/api/v1/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.count', 2);
    }

    public function test_mark_read_endpoint_flags_one_notification_and_clears_the_count(): void
    {
        $user = $this->createUser('owner@example.com', 'owner');
        $record = WorkforceNotification::create([
            'organization_id' => $this->organization->id, 'user_id' => $user->id,
            'type' => 'info', 'title' => 'Unread here',
        ]);

        $this->withHeaders($this->headers($user))
            ->patchJson("/api/v1/notifications/{$record->id}/read")
            ->assertOk()
            ->assertJsonPath('data.is_read', true)
            ->assertJsonPath('data.id', (string) $record->id);

        $this->assertNotNull($record->fresh()->read_at);
        $this->withHeaders($this->headers($user))
            ->getJson('/api/v1/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.count', 0);
    }

    public function test_mark_all_read_endpoint_clears_every_unread_notification(): void
    {
        $user = $this->createUser('owner@example.com', 'owner');
        WorkforceNotification::create(['organization_id' => $this->organization->id, 'user_id' => $user->id, 'type' => 'info', 'title' => 'One']);
        WorkforceNotification::create(['organization_id' => $this->organization->id, 'user_id' => $user->id, 'type' => 'info', 'title' => 'Two']);

        $this->withHeaders($this->headers($user))
            ->patchJson('/api/v1/notifications/read-all')
            ->assertOk()
            ->assertJsonPath('message', 'All notifications marked as read');

        $this->assertSame(0, WorkforceNotification::query()->where('user_id', $user->id)->whereNull('read_at')->count());
    }

    public function test_a_user_cannot_mark_another_users_notification_as_read(): void
    {
        $owner = $this->createUser('owner@example.com', 'owner');
        $intruder = $this->createUser('intruder@example.com', 'owner');
        $record = WorkforceNotification::create([
            'organization_id' => $this->organization->id, 'user_id' => $owner->id, 'type' => 'info', 'title' => 'Private',
        ]);

        $this->withHeaders($this->headers($intruder))
            ->patchJson("/api/v1/notifications/{$record->id}/read")
            ->assertNotFound();

        $this->assertNull($record->fresh()->read_at);
    }

    public function test_index_lists_unread_notifications_newest_first(): void
    {
        $user = $this->createUser('owner@example.com', 'owner');
        // forceCreate: created_at is not fillable, so create() would drop the backdate.
        WorkforceNotification::forceCreate([
            'organization_id' => $this->organization->id, 'user_id' => $user->id,
            'type' => 'info', 'title' => 'Older', 'created_at' => now()->subDay(),
        ]);
        WorkforceNotification::create([
            'organization_id' => $this->organization->id, 'user_id' => $user->id,
            'type' => 'info', 'title' => 'Newest',
        ]);

        $this->withHeaders($this->headers($user))
            ->getJson('/api/v1/notifications?status=unread')
            ->assertOk()
            ->assertJsonPath('data.0.title', 'Newest')
            ->assertJsonPath('data.1.title', 'Older')
            ->assertJsonPath('meta.total', 2);
    }
}
