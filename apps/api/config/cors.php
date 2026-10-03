<?php

$defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
];

$appUrl = trim((string) env('APP_URL', ''));
if ($appUrl !== '') {
    $defaultOrigins[] = rtrim($appUrl, '/');
}

$allowedOrigins = array_values(array_unique(array_filter(array_map(
    'trim',
    explode(',', (string) env(
        'CORS_ALLOWED_ORIGINS',
        implode(',', $defaultOrigins)
    ))
))));

if ($appUrl !== '' && ! in_array(rtrim($appUrl, '/'), $allowedOrigins, true)) {
    $allowedOrigins[] = rtrim($appUrl, '/');
}

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowedOrigins,
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Accept', 'Authorization', 'Content-Type', 'Origin', 'X-Requested-With', 'X-XSRF-TOKEN', 'X-Tenant-Key', 'X-Company-Key', 'X-Correlation-ID'],
    'exposed_headers' => [],
    'max_age' => 600,
    // First-party SPA authentication uses credentialed Sanctum session cookies.
    'supports_credentials' => true,
];
