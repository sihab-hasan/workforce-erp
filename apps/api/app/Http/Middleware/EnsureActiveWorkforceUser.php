<?php

namespace App\Http\Middleware;

use App\Services\AuthService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveWorkforceUser
{
    public function __construct(private readonly AuthService $authService) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $this->authService->isBlockedFromSignIn($user)) {
            $token = $user?->currentAccessToken();
            if ($token && method_exists($token, 'delete')) {
                $token->delete();
            } elseif ($request->hasSession()) {
                $this->authService->logoutBrowserSession($request);
            }
            abort(401, 'Unauthenticated.');
        }

        return $next($request);
    }
}
