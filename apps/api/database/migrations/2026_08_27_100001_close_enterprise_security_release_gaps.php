<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('access_requests', function (Blueprint $table): void {
            $table->foreignId('manager_approved_by')->nullable()->after('approvals')->constrained('users')->nullOnDelete();
            $table->timestamp('manager_approved_at')->nullable()->after('manager_approved_by');
            $table->foreignId('role_owner_approved_by')->nullable()->after('manager_approved_at')->constrained('users')->nullOnDelete();
            $table->timestamp('role_owner_approved_at')->nullable()->after('role_owner_approved_by');
            $table->foreignId('security_approved_by')->nullable()->after('role_owner_approved_at')->constrained('users')->nullOnDelete();
            $table->timestamp('security_approved_at')->nullable()->after('security_approved_by');
            $table->timestamp('provisioned_at')->nullable()->after('security_approved_at');
            $table->foreignId('rejected_by')->nullable()->after('provisioned_at')->constrained('users')->nullOnDelete();
            $table->timestamp('rejected_at')->nullable()->after('rejected_by');
            $table->string('rejection_reason', 1000)->nullable()->after('rejected_at');
        });

        Schema::table('approval_requests', function (Blueprint $table): void {
            $table->foreignId('rejected_by')->nullable()->after('executed_at')->constrained('users')->nullOnDelete();
            $table->timestamp('rejected_at')->nullable()->after('rejected_by');
            $table->string('review_note', 2000)->nullable()->after('rejected_at');
        });

        Schema::table('break_glass_grants', function (Blueprint $table): void {
            $table->string('status', 32)->default('active')->index()->after('reviewed_at');
            $table->timestamp('notification_sent_at')->nullable()->after('status');
            $table->foreignId('reviewed_by')->nullable()->after('notification_sent_at')->constrained('users')->nullOnDelete();
            $table->string('review_note', 2000)->nullable()->after('reviewed_by');
        });

        Schema::table('impersonation_sessions', function (Blueprint $table): void {
            $table->foreignId('approved_by')->nullable()->after('restricted_actions')->constrained('users')->nullOnDelete();
            $table->timestamp('started_at')->nullable()->after('approved_by');
            $table->unsignedBigInteger('action_count')->default(0)->after('started_at');
        });

        Schema::table('sod_rules', function (Blueprint $table): void {
            $table->string('severity', 32)->default('high')->after('control_type');
            $table->boolean('mitigation_required')->default(true)->after('severity');
        });
        Schema::table('sod_overrides', function (Blueprint $table): void {
            $table->string('reason', 1000)->nullable()->after('mitigation');
            $table->timestamp('revoked_at')->nullable()->after('expires_at');
        });

        Schema::create('organization_module_entitlements', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('module', 64);
            $table->boolean('enabled')->default(true);
            $table->string('source', 32)->default('plan');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->json('limits')->nullable();
            $table->timestamps();
            $table->unique(['organization_id', 'module']);
            $table->index(['organization_id', 'enabled', 'starts_at', 'ends_at'], 'org_module_effective_idx');
        });

        Schema::create('organization_onboarding_steps', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('step', 64);
            $table->string('status', 32)->default('pending');
            $table->json('payload')->nullable();
            $table->foreignId('completed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique(['organization_id', 'step']);
            $table->index(['organization_id', 'status']);
        });

        Schema::table('service_access_tokens', function (Blueprint $table): void {
            $table->string('audience', 64)->default('workforce-api')->after('token_hash');
        });

        // Canonical permission is employee.read. Migrate old employee.view grants forward safely.
        $readId = DB::table('permissions')->where('name', 'employee.read')->value('id');
        $viewId = DB::table('permissions')->where('name', 'employee.view')->value('id');
        if ($readId && $viewId) {
            foreach (DB::table('role_permissions')->where('permission_id', $viewId)->pluck('role_id') as $roleId) {
                DB::table('role_permissions')->updateOrInsert(['role_id' => $roleId, 'permission_id' => $readId]);
            }
            DB::table('role_permissions')->where('permission_id', $viewId)->delete();
            DB::table('permissions')->where('id', $viewId)->delete();
        }

        $defaultModules = ['hr', 'attendance', 'leave', 'documents', 'reports', 'users', 'security'];
        foreach (DB::table('organizations')->pluck('id') as $organizationId) {
            foreach ($defaultModules as $module) {
                DB::table('organization_module_entitlements')->updateOrInsert(
                    ['organization_id' => $organizationId, 'module' => $module],
                    ['enabled' => true, 'source' => 'migration', 'created_at' => now(), 'updated_at' => now()],
                );
            }
        }
    }

    public function down(): void
    {
        Schema::table('service_access_tokens', fn (Blueprint $table) => $table->dropColumn('audience'));
        Schema::dropIfExists('organization_onboarding_steps');
        Schema::dropIfExists('organization_module_entitlements');
        Schema::table('sod_overrides', fn (Blueprint $table) => $table->dropColumn(['reason', 'revoked_at']));
        Schema::table('sod_rules', fn (Blueprint $table) => $table->dropColumn(['severity', 'mitigation_required']));
        Schema::table('impersonation_sessions', fn (Blueprint $table) => $table->dropColumn(['approved_by', 'started_at', 'action_count']));
        Schema::table('break_glass_grants', fn (Blueprint $table) => $table->dropColumn(['status', 'notification_sent_at', 'reviewed_by', 'review_note']));
        Schema::table('approval_requests', fn (Blueprint $table) => $table->dropColumn(['rejected_by', 'rejected_at', 'review_note']));
        Schema::table('access_requests', fn (Blueprint $table) => $table->dropColumn([
            'manager_approved_by', 'manager_approved_at', 'role_owner_approved_by', 'role_owner_approved_at',
            'security_approved_by', 'security_approved_at', 'provisioned_at', 'rejected_by', 'rejected_at', 'rejection_reason',
        ]));
    }
};
