<?php

$defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:8000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:8000',
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

if ($appUrl !== '' && !in_array(rtrim($appUrl, '/'), $allowedOrigins, true)) {
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
