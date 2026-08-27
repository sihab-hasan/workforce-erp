<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Internal API Authentication
    |--------------------------------------------------------------------------
    |
    | Browser/user-facing routes authenticate with Laravel Sanctum. This shared
    | token is intentionally scoped to routes using the `api.key` middleware,
    | such as server-to-server connectivity checks or future trusted services.
    |
    */
    'shared_token' => env('API_SHARED_TOKEN'),
    'shared_token_header' => env('API_SHARED_TOKEN_HEADER', 'X-API-TOKEN'),
];
