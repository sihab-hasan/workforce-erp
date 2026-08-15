<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID', 'mock-google-client-id'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET', 'mock-google-client-secret'),
        'redirect' => env('GOOGLE_REDIRECT_URI', 'http://localhost:5174/portal/auth/callback/google'),
    ],

    'microsoft' => [
        'client_id' => env('MICROSOFT_CLIENT_ID', 'mock-microsoft-client-id'),
        'client_secret' => env('MICROSOFT_CLIENT_SECRET', 'mock-microsoft-client-secret'),
        'redirect' => env('MICROSOFT_REDIRECT_URI', 'http://localhost:5174/portal/auth/callback/microsoft'),
    ],

];
