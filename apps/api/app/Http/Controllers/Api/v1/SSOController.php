<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SsoCallbackRequest;
use App\Services\SsoService;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;

class SSOController extends Controller
{
    public function __construct(
        private readonly SsoService $ssoService,
        private readonly AuthService $authService
    ) {}

    public function redirectToProvider(string $provider): JsonResponse
    {
        $redirect = $this->ssoService->redirect($provider);

        return response()->json([
            'success' => true,
            ...$redirect,
        ]);
    }

    public function handleProviderCallback(SsoCallbackRequest $request, string $provider): JsonResponse
    {
        $validated = $request->validated();
        $user = $this->ssoService->authenticate($provider, $validated['code'], $validated['state']);
        $payload = $this->authService->establishBrowserSession($request, $user);
        $payload['sso_provider'] = $user->sso_provider;

        return response()->json([
            'success' => true,
            'user' => $payload,
        ]);
    }
}
