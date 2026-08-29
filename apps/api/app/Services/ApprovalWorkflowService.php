<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ApprovalWorkflowService
{
    public function __construct(private readonly SecurityAuditService $audit) {}

    public function submit(User $maker, ?int $org, string $action, ?string $type = null, ?string $id = null, array $payload = []): string
    {
        $uuid = (string) Str::uuid();
        DB::table('approval_requests')->insert(['id' => $uuid, 'organization_id' => $org, 'maker_user_id' => $maker->id, 'action' => $action, 'resource_type' => $type, 'resource_id' => $id, 'payload' => json_encode($payload), 'status' => 'submitted', 'created_at' => now(), 'updated_at' => now()]);
        $this->audit->record('approval.submitted', $maker, ['organization_id' => $org, 'resource_type' => $type ?? 'approval', 'resource_id' => $id ?? $uuid]);

        return $uuid;
    }

    public function approve(string $id, User $approver, ?string $note = null): void
    {
        DB::transaction(function () use ($id, $approver, $note) {
            $row = DB::table('approval_requests')->where('id', $id)->lockForUpdate()->first();
            if (! $row) {
                abort(404, 'Approval request not found.');
            }if ((int) $row->maker_user_id === (int) $approver->id) {
                abort(409, 'Maker and checker must be different users.');
            }if ($row->status !== 'submitted') {
                abort(409, 'Approval request is not pending.');
            }DB::table('approval_requests')->where('id', $id)->update(['approver_user_id' => $approver->id, 'status' => 'approved', 'approved_at' => now(), 'review_note' => $note, 'updated_at' => now()]);
            $this->audit->record('approval.approved', $approver, ['organization_id' => $row->organization_id, 'resource_type' => $row->resource_type ?? 'approval', 'resource_id' => $row->resource_id ?? $id]);
        });
    }

    public function reject(string $id, User $approver, ?string $note = null): void
    {
        DB::transaction(function () use ($id, $approver, $note) {
            $row = DB::table('approval_requests')->where('id', $id)->lockForUpdate()->first();
            if (! $row) {
                abort(404, 'Approval request not found.');
            }if ((int) $row->maker_user_id === (int) $approver->id) {
                abort(409, 'Maker and checker must be different users.');
            }if ($row->status !== 'submitted') {
                abort(409, 'Approval request is not pending.');
            }DB::table('approval_requests')->where('id', $id)->update(['rejected_by' => $approver->id, 'status' => 'rejected', 'rejected_at' => now(), 'review_note' => $note, 'updated_at' => now()]);
            $this->audit->record('approval.rejected', $approver, ['organization_id' => $row->organization_id, 'resource_type' => $row->resource_type ?? 'approval', 'resource_id' => $row->resource_id ?? $id]);
        });
    }

    public function execute(string $id, User $executor, callable $callback): mixed
    {
        return DB::transaction(function () use ($id, $executor, $callback) {
            $row = DB::table('approval_requests')->where('id', $id)->lockForUpdate()->first();
            if (! $row) {
                abort(404, 'Approval request not found.');
            }if ($row->status !== 'approved') {
                abort(409, 'Only approved requests may execute.');
            }$result = $callback($row);
            DB::table('approval_requests')->where('id', $id)->update(['status' => 'executed', 'executed_at' => now(), 'updated_at' => now()]);
            $this->audit->record('approval.executed', $executor, ['organization_id' => $row->organization_id, 'resource_type' => $row->resource_type ?? 'approval', 'resource_id' => $row->resource_id ?? $id]);

            return $result;
        });
    }
}
