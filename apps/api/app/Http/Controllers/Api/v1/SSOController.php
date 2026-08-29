<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SsoCallbackRequest;
use App\Services\AuthService;
use App\Services\SsoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SSOController extends Controller
{
    public function __construct(
        private readonly SsoService $sso,
        private readonly AuthService $auth,
    ) {}

    public function redirectToProvider(Request $request, string $provider): JsonResponse
    {
        $client = $this->auth->normalizeClient((string) $request->query('client', 'erp'));

        return response()->json([
            'success' => true,
            ...$this->sso->redirect($provider, $client),
        ]);
    }

    public function handleProviderCallback(SsoCallbackRequest $request, string $provider): JsonResponse
    {
        $client = $this->auth->normalizeClient((string) $request->validated('client'));
        $user = $this->sso->authenticate(
            $provider,
            (string) $request->validated('code'),
            (string) $request->validated('state'),
            $client,
        );

        return response()->json($this->auth->beginBrowserAuthentication($request, $user, 'sso:'.$provider));
    }
}
