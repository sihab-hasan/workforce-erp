<?php

return [
    'mfa' => [
        'default_required' => (bool) env('MFA_DEFAULT_REQUIRED', false),
        'privileged_roles' => ['organization_owner', 'organization_admin', 'security_admin', 'hr_admin', 'finance_admin', 'payroll_admin', 'auditor'],
        'platform_privileged_roles' => ['platform_super_admin', 'platform_security_admin', 'platform_support', 'platform_auditor'],
        'challenge_ttl_minutes' => (int) env('MFA_CHALLENGE_TTL_MINUTES', 5),
        'max_attempts' => (int) env('MFA_MAX_ATTEMPTS', 5),
        'resend_cooldown_seconds' => (int) env('MFA_RESEND_COOLDOWN_SECONDS', 60),
        'step_up_ttl_minutes' => (int) env('STEP_UP_TTL_MINUTES', 10),
    ],
    'session' => [
        'standard_idle_minutes' => (int) env('SESSION_IDLE_MINUTES', 120),
        'standard_absolute_minutes' => (int) env('SESSION_ABSOLUTE_MINUTES', 1440),
        'privileged_idle_minutes' => (int) env('PRIVILEGED_SESSION_IDLE_MINUTES', 30),
        'privileged_absolute_minutes' => (int) env('PRIVILEGED_SESSION_ABSOLUTE_MINUTES', 480),
    ],
    'registration' => [
        'ttl_minutes' => (int) env('REGISTRATION_CHALLENGE_TTL_MINUTES', 10),
        'trial_days' => (int) env('TRIAL_DAYS', 14),
    ],
    'invitation' => ['ttl_hours' => (int) env('INVITATION_TTL_HOURS', 72)],
    'sms' => [
        'driver' => env('SMS_DRIVER'),
        'endpoint' => env('SMS_HTTP_ENDPOINT'),
        'token' => env('SMS_HTTP_TOKEN'),
        'sender' => env('SMS_SENDER'),
    ],
    'risk' => [
        'failed_login_threshold' => (int) env('RISK_FAILED_LOGIN_THRESHOLD', 5),
        'failed_verification_threshold' => (int) env('RISK_FAILED_VERIFICATION_THRESHOLD', 4),
    ],
    'service_accounts' => [
        'token_ttl_minutes' => (int) env('SERVICE_TOKEN_TTL_MINUTES', 60),
        'audiences' => ['workforce-api'],
    ],
    'subscription' => [
        'modules' => [
            'hr' => 'Human Resources', 'attendance' => 'Attendance & Timesheets', 'leave' => 'Leave Management',
            'documents' => 'Documents', 'reports' => 'Reports', 'users' => 'Users & Access', 'security' => 'Security Administration',
            'payroll' => 'Payroll', 'purchases' => 'Purchases', 'inventory' => 'Inventory', 'sales' => 'Sales',
        ],
        'plan_modules' => [
            'trial' => ['hr', 'attendance', 'leave', 'documents', 'reports', 'users', 'security'],
            'default' => ['hr', 'attendance', 'leave', 'documents', 'reports', 'users', 'security'],
        ],
    ],
    'break_glass' => [
        'max_minutes' => (int) env('BREAK_GLASS_MAX_MINUTES', 60),
        'tenant_permissions' => ['security.manage', 'session.manage', 'user.manage', 'role.manage', 'role.assign', 'audit.view'],
        'platform_permissions' => ['platform.users.read', 'platform.organizations.read', 'platform.audit.read', 'platform.impersonation.end'],
    ],
    'impersonation' => [
        'restricted_actions' => ['security.manage', 'payment.approve', 'payroll.approve', 'service_account.manage', 'organization.owner.assign', 'role.assign'],
    ],
    'platform' => [
        'host' => env('ADMIN_URL'),
        'role_permissions' => [
            'platform_super_admin' => ['platform.users.read', 'platform.organizations.read', 'platform.audit.read', 'platform.impersonation.start', 'platform.impersonation.end', 'platform.break_glass.start', 'platform.break_glass.review'],
            'platform_security_admin' => ['platform.users.read', 'platform.organizations.read', 'platform.audit.read', 'platform.impersonation.end', 'platform.break_glass.start', 'platform.break_glass.review'],
            'platform_support' => ['platform.users.read', 'platform.organizations.read', 'platform.impersonation.start', 'platform.impersonation.end'],
            'platform_auditor' => ['platform.users.read', 'platform.organizations.read', 'platform.audit.read'],
        ],
    ],
];
