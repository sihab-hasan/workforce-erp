<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TestMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('api/health') || $request->is('api/v1/auth/*')) {
            return $next($request);
        }

        $token = $request->header('X-API-TOKEN');

        if ($token !== 'my-secret-token') {
            throw new \Illuminate\Auth\AuthenticationException('Invalid or missing token.');
        }

        return $next($request);
    }
}
