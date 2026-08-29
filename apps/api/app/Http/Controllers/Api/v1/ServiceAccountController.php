<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Services\ServiceAccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceAccountController extends Controller
{
    public function __construct(
        private readonly ServiceAccountService $service,
    ) {}

    public function token(Request $request): JsonResponse
    {
        $data = $request->validate([
            'client_id' => ['required', 'string', 'max:96'],
            'client_secret' => ['required', 'string', 'max:255'],
            'audience' => ['nullable', 'string', 'max:64'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->service->issueToken(
                $data['client_id'],
                $data['client_secret'],
                $data['audience'] ?? 'workforce-api',
                $request->ip(),
            ),
        ]);
    }

    public function context(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->service->context($request),
        ]);
    }

    public function revoke(Request $request): JsonResponse
    {
        $this->service->revokeCurrent($request);

        return response()->json([
            'success' => true,
        ]);
    }
}
