<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TestMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->header('X-API-TOKEN');

        if ($token !== 'my-secret-token') {
            return response()->json([
                'error' => 'Unauthorized access',
                'message' => 'Invalid or missing token.',
            ], 401);
        }

        return $next($request);
    }
}
