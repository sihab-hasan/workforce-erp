<?php

namespace App\Services;

use App\Mail\VerificationCodeMail;
use App\Models\Organization;
use App\Models\RegistrationChallenge;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class RegistrationService
{
    public function __construct(
        private readonly SecurityAuditService $audit,
    ) {}

    public function start(array $data, Request $request): RegistrationChallenge
    {
        if (User::query()->where('email', $data['email'])->exists()) {
            abort(409, 'Registration cannot be completed with these details.');
        }

        $code = $this->generateCode();
        $challenge = RegistrationChallenge::query()->create([
            'id' => (string) Str::uuid(),
            'full_name' => $data['name'],
            'email' => Str::lower(trim($data['email'])),
            'organization_name' => trim($data['organization_name']),
            'country' => strtoupper($data['country']),
            'phone' => $data['phone'] ?? null,
            'password_hash' => Hash::make($data['password']),
            'terms_accepted' => true,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes((int) config('security.registration.ttl_minutes', 10)),
            'resend_available_at' => now()->addSeconds((int) config('security.mfa.resend_cooldown_seconds', 60)),
            'client' => $data['client'] ?? 'erp',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        Mail::to($challenge->email)->send(
            new VerificationCodeMail(
                $code,
                (int) config('security.registration.ttl_minutes', 10),
                'email_verification',
            ),
        );

        return $challenge;
    }

    public function resend(RegistrationChallenge $challenge): void
    {
        $this->assertUsable($challenge);

        if ($challenge->resend_available_at && now()->lt($challenge->resend_available_at)) {
            abort(429, 'Please wait before requesting another code.');
        }

        $code = $this->generateCode();
        $challenge->forceFill([
            'code_hash' => Hash::make($code),
            'attempt_count' => 0,
            'resend_available_at' => now()->addSeconds((int) config('security.mfa.resend_cooldown_seconds', 60)),
        ])->save();

        Mail::to($challenge->email)->send(
            new VerificationCodeMail(
                $code,
                (int) config('security.registration.ttl_minutes', 10),
                'email_verification',
            ),
        );
    }

    public function verify(RegistrationChallenge $challenge, string $code): User
    {
        $this->assertUsable($challenge);

        if ($challenge->attempt_count >= $challenge->max_attempts) {
            abort(429, 'Too many verification attempts.');
        }

        if (! Hash::check($code, $challenge->code_hash)) {
            $challenge->increment('attempt_count');
            abort(400, 'Invalid or expired verification code.');
        }

        return DB::transaction(function () use ($challenge) {
            if (User::query()->where('email', $challenge->email)->exists()) {
                abort(409, 'Registration cannot be completed with these details.');
            }

            $user = User::query()->create([
                'name' => $challenge->full_name,
                'email' => $challenge->email,
                'phone' => $challenge->phone,
                'password' => $challenge->password_hash,
                'email_verified_at' => now(),
                'password_initialized_at' => now(),
                'status' => 'active',
            ]);

            $user->forceFill([
                'email_verified_at' => now(),
                'password_initialized_at' => now(),
            ])->save();

            $baseSlug = Str::slug($challenge->organization_name) ?: 'organization';
            $slug = $baseSlug;
            $counter = 2;
            while (Organization::withTrashed()->where('slug', $slug)->exists()) {
                $slug = $baseSlug.'-'.$counter++;
            }

            $organization = Organization::query()->create([
                'name' => $challenge->organization_name,
                'slug' => $slug,
                'country' => $challenge->country,
                'status' => 'active',
                'plan' => 'trial',
                'trial_started_at' => now(),
                'trial_ends_at' => now()->addDays((int) config('security.registration.trial_days', 14)),
                'subscription_status' => 'trialing',
                'onboarding_status' => 'in_progress',
                'onboarding_step' => 'organization',
            ]);

            $membership = $user->memberships()->create([
                'organization_id' => $organization->id,
                'role' => 'owner',
                'status' => 'active',
                'data_scope' => 'ORGANIZATION',
                'activated_at' => now(),
            ]);

            $this->ensureDefaultRoles($organization->id);
            $ownerRole = Role::query()
                ->where('organization_id', $organization->id)
                ->where('name', 'organization_owner')
                ->firstOrFail();

            $membership->roleAssignments()->create([
                'role_id' => $ownerRole->id,
                'scope' => 'ORGANIZATION',
                'reason' => 'Initial tenant owner provisioning',
            ]);

            $challenge->forceFill([
                'consumed_at' => now(),
                'code_hash' => 'consumed',
            ])->save();

            $this->audit->record('registration.completed', $user, [
                'subject_user_id' => $user->id,
                'organization_id' => $organization->id,
            ]);

            return $user;
        });
    }

    public function ensureDefaultRoles(int $organizationId): void
    {
        $permissions = DB::table('permissions')->pluck('id', 'name');
        $roles = [
            'organization_owner' => $permissions->keys()->all(),
            'organization_admin' => $permissions->keys()->reject(fn ($p) => in_array($p, ['organization.owner.assign', 'impersonation.start', 'break_glass.start'], true))->all(),
            'manager' => [
                'organization.view', 'company.view', 'department.view', 'employee.read',
                'leave.view', 'leave.manage', 'leave.approve', 'timesheet.view',
                'timesheet.manage', 'approval.view', 'approval.approve', 'document.view',
                'document.manage', 'notification.view', 'report.view', 'user.view',
            ],
            'employee' => [
                'organization.view', 'company.view', 'department.view', 'employee.read',
                'leave.view', 'timesheet.view', 'document.view', 'notification.view',
            ],
            'auditor' => [
                'organization.view', 'company.view', 'department.view', 'employee.read',
                'leave.view', 'timesheet.view', 'approval.view', 'document.view',
                'notification.view', 'report.view', 'audit.view',
            ],
        ];

        foreach ($roles as $name => $permissionNames) {
            $role = Role::query()->firstOrCreate(
                ['organization_id' => $organizationId, 'name' => $name],
                ['description' => Str::headline($name)],
            );
            $role->permissions()->sync(
                collect($permissionNames)->map(fn ($name) => $permissions[$name] ?? null)->filter()->values()->all(),
            );
        }
    }

    private function assertUsable(RegistrationChallenge $challenge): void
    {
        if ($challenge->consumed_at || now()->gte($challenge->expires_at)) {
            abort(400, 'Invalid or expired registration challenge.');
        }
    }

    private function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
