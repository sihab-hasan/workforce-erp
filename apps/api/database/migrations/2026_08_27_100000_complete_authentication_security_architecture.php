<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 32)->nullable()->unique()->after('email_verified_at');
            $table->timestamp('phone_verified_at')->nullable()->after('phone');
            $table->timestamp('password_initialized_at')->nullable()->after('phone_verified_at');
            $table->string('status', 32)->default('active')->index()->after('password_initialized_at');
            $table->unsignedBigInteger('auth_version')->default(1)->after('status');
            $table->unsignedBigInteger('authz_version')->default(1)->after('auth_version');
            $table->timestamp('locked_at')->nullable()->after('authz_version');
            $table->json('security_metadata')->nullable()->after('locked_at');
        });

        DB::table('users')->whereNull('password_initialized_at')->update(['password_initialized_at' => now()]);

        Schema::table('organizations', function (Blueprint $table) {
            $table->string('country', 2)->nullable()->after('locale');
            $table->string('currency', 3)->default('USD')->after('country');
            $table->unsignedTinyInteger('fiscal_year_start_month')->default(1)->after('currency');
            $table->string('plan', 64)->default('trial')->after('status');
            $table->timestamp('trial_started_at')->nullable()->after('plan');
            $table->timestamp('trial_ends_at')->nullable()->after('trial_started_at');
            $table->string('subscription_status', 32)->default('trialing')->index()->after('trial_ends_at');
            $table->timestamp('subscription_started_at')->nullable()->after('subscription_status');
            $table->timestamp('subscription_ends_at')->nullable()->after('subscription_started_at');
            $table->timestamp('grace_period_ends_at')->nullable()->after('subscription_ends_at');
            $table->string('onboarding_status', 32)->default('not_started')->after('grace_period_ends_at');
            $table->string('onboarding_step', 64)->nullable()->after('onboarding_status');
            $table->json('onboarding_data')->nullable()->after('onboarding_step');
        });

        Schema::table('organization_members', function (Blueprint $table) {
            $table->string('data_scope', 32)->default('OWN')->after('status');
            $table->json('scope_data')->nullable()->after('data_scope');
            $table->timestamp('activated_at')->nullable()->after('scope_data');
            $table->timestamp('suspended_at')->nullable()->after('activated_at');
            $table->index(['organization_id', 'status']);
        });

        Schema::create('membership_role_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_member_id')->constrained('organization_members')->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->string('scope', 32)->default('OWN');
            $table->json('scope_data')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reason', 500)->nullable();
            $table->timestamps();
            $table->unique(['organization_member_id', 'role_id'], 'membership_role_unique');
            $table->index(['organization_member_id', 'starts_at', 'expires_at'], 'membership_role_effective_idx');
        });

        Schema::create('platform_role_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role', 64);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reason', 500)->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'role']);
            $table->index(['role', 'starts_at', 'expires_at']);
        });

        Schema::create('registration_challenges', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('full_name');
            $table->string('email')->index();
            $table->string('organization_name');
            $table->string('country', 2);
            $table->string('phone', 32)->nullable();
            $table->string('password_hash');
            $table->boolean('terms_accepted');
            $table->string('code_hash');
            $table->unsignedTinyInteger('attempt_count')->default(0);
            $table->unsignedTinyInteger('max_attempts')->default(5);
            $table->timestamp('resend_available_at')->nullable();
            $table->timestamp('expires_at')->index();
            $table->timestamp('consumed_at')->nullable();
            $table->string('client', 32)->default('erp');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });

        Schema::create('verification_challenges', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('purpose', 64)->index();
            $table->string('primary_authentication_method', 96)->nullable();
            $table->json('available_methods');
            $table->string('selected_method', 32)->nullable();
            $table->string('code_hash')->nullable();
            $table->unsignedTinyInteger('attempt_count')->default(0);
            $table->unsignedTinyInteger('max_attempts')->default(5);
            $table->timestamp('resend_available_at')->nullable();
            $table->timestamp('expires_at')->index();
            $table->timestamp('consumed_at')->nullable();
            $table->string('client', 32)->default('erp');
            $table->json('risk_metadata')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'purpose', 'consumed_at'], 'verification_user_purpose_idx');
        });

        Schema::create('authenticator_factors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('secret');
            $table->string('label')->default('Authenticator App');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'confirmed_at']);
        });

        Schema::create('organization_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organization_member_id')->constrained('organization_members')->cascadeOnDelete();
            $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('email')->index();
            $table->char('token_hash', 64)->unique();
            $table->json('role_ids');
            $table->string('data_scope', 32)->default('OWN');
            $table->json('scope_data')->nullable();
            $table->timestamp('expires_at')->index();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });

        Schema::create('security_audit_events', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('event_type', 120)->index();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('subject_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->string('session_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('authentication_method', 96)->nullable();
            $table->string('resource_type', 120)->nullable();
            $table->string('resource_id', 191)->nullable();
            $table->json('before_state')->nullable();
            $table->json('after_state')->nullable();
            $table->uuid('correlation_id')->index();
            $table->boolean('success')->default(true)->index();
            $table->string('failure_reason', 500)->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
            $table->index(['organization_id', 'created_at']);
        });

        Schema::create('organization_domains', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('domain')->unique();
            $table->char('verification_token_hash', 64);
            $table->string('status', 32)->default('pending')->index();
            $table->timestamp('verified_at')->nullable();
            $table->boolean('only_verified_domain_users')->default(false);
            $table->boolean('allow_domain_access_requests')->default(false);
            $table->boolean('enforce_sso_for_domain')->default(false);
            $table->timestamps();
        });

        Schema::create('sod_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('permission_a', 120);
            $table->string('permission_b', 120);
            $table->string('control_type', 32)->default('preventive');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['organization_id', 'permission_a', 'permission_b'], 'sod_rule_unique');
        });

        Schema::create('sod_overrides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sod_rule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('approved_by')->constrained('users')->restrictOnDelete();
            $table->string('mitigation', 1000);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('approval_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('organization_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('maker_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('approver_user_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->string('action', 120);
            $table->string('resource_type', 120)->nullable();
            $table->string('resource_id', 191)->nullable();
            $table->json('payload')->nullable();
            $table->string('status', 32)->default('submitted')->index();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('executed_at')->nullable();
            $table->timestamps();
            $table->index(['organization_id', 'status']);
        });

        Schema::create('access_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('requester_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->string('scope', 32);
            $table->json('scope_data')->nullable();
            $table->string('status', 32)->default('pending_manager')->index();
            $table->timestamp('expires_at')->nullable();
            $table->json('approvals')->nullable();
            $table->timestamps();
        });

        Schema::create('service_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('client_id', 96)->unique();
            $table->string('status', 32)->default('active')->index();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->string('last_ip', 45)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
        Schema::create('service_account_credentials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_account_id')->constrained()->cascadeOnDelete();
            $table->string('secret_hash');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamp('rotated_at')->nullable();
            $table->timestamps();
        });
        Schema::create('service_account_permissions', function (Blueprint $table) {
            $table->foreignId('service_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            $table->primary(['service_account_id', 'permission_id']);
        });
        Schema::create('service_account_scopes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_account_id')->constrained()->cascadeOnDelete();
            $table->string('scope', 32);
            $table->json('scope_data')->nullable();
            $table->timestamps();
        });
        Schema::create('service_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_account_id')->constrained()->cascadeOnDelete();
            $table->char('token_hash', 64)->unique();
            $table->timestamp('expires_at');
            $table->timestamp('last_used_at')->nullable();
            $table->string('last_ip', 45)->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });

        Schema::create('break_glass_grants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('reason', 1000);
            $table->timestamp('starts_at');
            $table->timestamp('expires_at')->index();
            $table->timestamp('ended_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('impersonation_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('actor_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('subject_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('support_ticket', 191);
            $table->string('reason', 1000);
            $table->timestamp('expires_at')->index();
            $table->timestamp('ended_at')->nullable();
            $table->json('restricted_actions')->nullable();
            $table->timestamps();
        });

        Schema::table('user_sso_identities', function (Blueprint $table) {
            $table->string('issuer', 255)->nullable()->after('provider');
            $table->string('provider_tenant', 191)->nullable()->after('issuer');
            $table->string('provider_subject_id', 191)->nullable()->after('provider_tenant');
            $table->json('metadata')->nullable()->after('email');
            $table->index(['provider', 'issuer', 'provider_subject_id'], 'sso_subject_lookup_idx');
        });
        DB::table('user_sso_identities')->whereNull('provider_subject_id')->update([
            'provider_subject_id' => DB::raw('provider_user_id'),
        ]);

        Schema::table('sessions', function (Blueprint $table) {
            $table->unsignedBigInteger('auth_version')->nullable()->after('user_id');
            $table->unsignedBigInteger('authz_version')->nullable()->after('auth_version');
            $table->string('authentication_method', 96)->nullable()->after('authz_version');
            $table->string('mfa_level', 32)->nullable()->after('authentication_method');
            $table->timestamp('recent_verified_at')->nullable()->after('mfa_level');
            $table->timestamp('absolute_expires_at')->nullable()->after('recent_verified_at')->index();
            $table->string('client', 32)->nullable()->after('absolute_expires_at');
            $table->json('risk_flags')->nullable()->after('client');
        });

        $this->seedPermissionCatalogAndBackfillRoles();

        // Legacy generic OTP table preserved for backwards compatibility.
        // Active verification now uses purpose-bound challenges.
    }

    private function seedPermissionCatalogAndBackfillRoles(): void
    {
        $permissions = [
            'organization.view', 'organization.manage', 'organization.owner.assign', 'company.view', 'company.manage',
            'department.view', 'department.manage', 'employee.view', 'employee.manage', 'employee.read',
            'leave.view', 'leave.manage', 'leave.approve', 'timesheet.view', 'timesheet.manage',
            'approval.view', 'approval.approve', 'document.view', 'document.manage', 'notification.view',
            'report.view', 'report.export', 'user.view', 'user.manage', 'user.invite', 'role.view', 'role.manage', 'role.assign',
            'settings.view', 'settings.manage', 'security.manage', 'session.manage', 'domain.manage', 'subscription.view',
            'onboarding.manage', 'access_request.create', 'access_request.approve', 'service_account.manage',
            'audit.view', 'impersonation.start', 'break_glass.start', 'payroll.prepare', 'payroll.approve', 'payment.approve',
            'vendor.create', 'vendor.approve', 'purchase.create', 'purchase.approve', 'journal.create', 'journal.post',
            'refund.create', 'refund.approve',
        ];
        foreach ($permissions as $name) {
            DB::table('permissions')->updateOrInsert(['name' => $name], [
                'description' => ucwords(str_replace(['.', '_'], ' ', $name)),
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }

        $legacyMap = [
            'owner' => 'organization_owner', 'admin' => 'organization_admin', 'manager' => 'manager',
            'staff' => 'employee', 'member' => 'employee', 'readonly' => 'auditor',
        ];
        $rolePermissions = [
            'organization_owner' => $permissions,
            'organization_admin' => array_values(array_diff($permissions, ['organization.owner.assign', 'impersonation.start', 'break_glass.start'])),
            'manager' => ['organization.view', 'company.view', 'department.view', 'employee.view', 'employee.read', 'leave.view', 'leave.manage', 'leave.approve', 'timesheet.view', 'timesheet.manage', 'approval.view', 'approval.approve', 'document.view', 'document.manage', 'notification.view', 'report.view', 'user.view'],
            'employee' => ['organization.view', 'company.view', 'department.view', 'employee.read', 'leave.view', 'timesheet.view', 'document.view', 'notification.view'],
            'auditor' => ['organization.view', 'company.view', 'department.view', 'employee.view', 'leave.view', 'timesheet.view', 'approval.view', 'document.view', 'notification.view', 'report.view', 'audit.view'],
        ];

        $organizations = DB::table('organizations')->pluck('id');
        foreach ($organizations as $organizationId) {
            foreach ($rolePermissions as $roleName => $permissionNames) {
                $roleId = DB::table('roles')->where('organization_id', $organizationId)->where('name', $roleName)->value('id');
                if (! $roleId) {
                    $roleId = DB::table('roles')->insertGetId([
                        'organization_id' => $organizationId, 'name' => $roleName,
                        'description' => ucwords(str_replace('_', ' ', $roleName)), 'created_at' => now(), 'updated_at' => now(),
                    ]);
                }
                foreach ($permissionNames as $permissionName) {
                    $permissionId = DB::table('permissions')->where('name', $permissionName)->value('id');
                    if ($permissionId) {
                        DB::table('role_permissions')->updateOrInsert(['role_id' => $roleId, 'permission_id' => $permissionId]);
                    }
                }
            }
        }

        DB::table('organization_members')->orderBy('id')->chunkById(100, function ($members) use ($legacyMap): void {
            foreach ($members as $member) {
                $canonical = $legacyMap[$member->role] ?? 'employee';
                $roleId = DB::table('roles')->where('organization_id', $member->organization_id)->where('name', $canonical)->value('id');
                if ($roleId) {
                    DB::table('membership_role_assignments')->updateOrInsert(
                        ['organization_member_id' => $member->id, 'role_id' => $roleId],
                        ['scope' => $member->data_scope ?: 'OWN', 'created_at' => now(), 'updated_at' => now()]
                    );
                }
                if ($member->status === 'active' && ! $member->activated_at) {
                    DB::table('organization_members')->where('id', $member->id)->update(['activated_at' => now()]);
                }
            }
        });

        foreach ([['vendor.create', 'vendor.approve'], ['purchase.create', 'purchase.approve'], ['payroll.prepare', 'payroll.approve'], ['journal.create', 'journal.post'], ['refund.create', 'refund.approve']] as [$a, $b]) {
            DB::table('sod_rules')->updateOrInsert(['organization_id' => null, 'permission_a' => $a, 'permission_b' => $b], ['control_type' => 'preventive', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        Schema::table('sessions', function (Blueprint $table) {
            $table->dropColumn(['auth_version', 'authz_version', 'authentication_method', 'mfa_level', 'recent_verified_at', 'absolute_expires_at', 'client', 'risk_flags']);
        });
        Schema::table('user_sso_identities', function (Blueprint $table) {
            $table->dropIndex('sso_subject_lookup_idx');
            $table->dropColumn(['issuer', 'provider_tenant', 'provider_subject_id', 'metadata']);
        });
        foreach (['impersonation_sessions', 'break_glass_grants', 'service_access_tokens', 'service_account_scopes', 'service_account_permissions', 'service_account_credentials', 'service_accounts', 'access_requests', 'approval_requests', 'sod_overrides', 'sod_rules', 'organization_domains', 'security_audit_events', 'organization_invitations', 'authenticator_factors', 'verification_challenges', 'registration_challenges', 'platform_role_assignments', 'membership_role_assignments'] as $table) {
            Schema::dropIfExists($table);
        }
        Schema::table('organization_members', function (Blueprint $table) {
            $table->dropIndex(['organization_id', 'status']);
            $table->dropColumn(['data_scope', 'scope_data', 'activated_at', 'suspended_at']);
        });
        DB::table('users')->whereNull('password_initialized_at')->update(['password_initialized_at' => now()]);

        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn(['country', 'currency', 'fiscal_year_start_month', 'plan', 'trial_started_at', 'trial_ends_at', 'subscription_status', 'subscription_started_at', 'subscription_ends_at', 'grace_period_ends_at', 'onboarding_status', 'onboarding_step', 'onboarding_data']);
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['phone']);
            $table->dropColumn(['phone', 'phone_verified_at', 'password_initialized_at', 'status', 'auth_version', 'authz_version', 'locked_at', 'security_metadata']);
        });
    }
};
