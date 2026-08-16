<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $configuredToken = (string) config('api.shared_token', '');
        $headerName = (string) config('api.shared_token_header', 'X-API-TOKEN');

        if ($configuredToken === '') {
            return new JsonResponse([
                'success' => false,
                'message' => 'Internal API token authentication is not configured.',
            ], 503);
        }

        $providedToken = (string) $request->header($headerName, '');

        if ($providedToken === '' || ! hash_equals($configuredToken, $providedToken)) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Invalid or missing API token.',
            ], 401);
        }

        return $next($request);
    }
}
