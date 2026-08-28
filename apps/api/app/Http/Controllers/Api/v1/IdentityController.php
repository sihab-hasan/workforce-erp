<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\VerificationChallenge;
use App\Services\AuthService;
use App\Services\IdentityChangeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IdentityController extends Controller
{
    public function __construct(
        private readonly IdentityChangeService $changes,
        private readonly AuthService $auth,
    ) {}

    public function requestEmail(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email:rfc', 'max:255'],
        ]);

        $challenge = $this->changes->requestEmail($request, $data['email']);

        return response()->json([
            'success' => true,
            'challenge' => $this->auth->challengePayload($challenge),
        ]);
    }

    public function confirmEmail(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'regex:/^\d{6}$/'],
        ]);

        $challenge = VerificationChallenge::findOrFail($id);
        $this->changes->confirmEmail($request, $challenge, $data['code']);

        return response()->json([
            'success' => true,
            'message' => 'Email changed. Sign in again.',
        ]);
    }

    public function requestPhone(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'regex:/^\+[1-9]\d{7,14}$/'],
        ]);

        $challenge = $this->changes->requestPhone($request, $data['phone']);

        return response()->json([
            'success' => true,
            'challenge' => $this->auth->challengePayload($challenge),
        ]);
    }

    public function confirmPhone(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'regex:/^\d{6}$/'],
        ]);

        $challenge = VerificationChallenge::findOrFail($id);
        $this->changes->confirmPhone($request, $challenge, $data['code']);

        return response()->json([
            'success' => true,
            'message' => 'Phone changed. Sign in again.',
        ]);
    }
}
