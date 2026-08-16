<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RequestOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use App\Services\AuthService;

class OTPController extends Controller
{
    public function __construct(
        private readonly OtpService $otpService,
        private readonly AuthService $authService
    ) {}

    public function requestOtp(RequestOtpRequest $request): JsonResponse
    {
        $this->otpService->request($request->validated('email'));

        return response()->json([
            'success' => true,
            'message' => 'If the account is eligible and email delivery is available, a one-time code will arrive shortly.',
        ]);
    }

    public function verifyOtp(VerifyOtpRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $this->otpService->verify($validated['email'], $validated['code']);

        return response()->json([
            'success' => true,
            'user' => $this->authService->establishBrowserSession($request, $user),
        ]);
    }
}
