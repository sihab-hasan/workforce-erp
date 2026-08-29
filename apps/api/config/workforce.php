<?php

return [
    'trusted_hosts' => array_values(array_filter(array_map(
        static fn (string $host): string => trim($host),
        explode(',', (string) env('TRUSTED_HOSTS', ''))
    ))),
    'portal_url' => rtrim((string) env('PORTAL_URL', env('PUBLIC_ERP_URL', env('ERP_URL', 'http://localhost:5174'))), '/'),

    /*
    |--------------------------------------------------------------------------
    | Local bootstrap account
    |--------------------------------------------------------------------------
    |
    | Used only by DatabaseSeeder while APP_ENV=local. This gives a freshly
    | migrated developer database one legitimate tenant owner for testing the
    | real authentication flow. Production/staging are never bootstrapped here.
    |
    */
    'local_bootstrap' => [
        'enabled' => env('LOCAL_BOOTSTRAP_ENABLED', false),
        'organization_name' => env('LOCAL_BOOTSTRAP_ORGANIZATION_NAME', 'Workforce Local'),
        'organization_slug' => env('LOCAL_BOOTSTRAP_ORGANIZATION_SLUG', 'workforce-local'),
        'owner_name' => env('LOCAL_BOOTSTRAP_OWNER_NAME', 'Local Owner'),
        'owner_email' => env('LOCAL_BOOTSTRAP_OWNER_EMAIL', 'owner@workforce.local'),
        'owner_password' => env('LOCAL_BOOTSTRAP_OWNER_PASSWORD', ''),
    ],
];
