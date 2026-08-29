<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\VerifyRegistrationRequest;
use App\Models\RegistrationChallenge;
use App\Services\AuthService;
use App\Services\RegistrationService;
use Illuminate\Http\JsonResponse;

class RegistrationController extends Controller
{
    public function __construct(
        private readonly RegistrationService $registrations,
        private readonly AuthService $auth,
    ) {}

    public function start(RegisterRequest $request): JsonResponse
    {
        $challenge = $this->registrations->start($request->validated(), $request);

        return response()->json([
            'success' => true,
            'status' => 'verification_required',
            'challenge' => [
                'id' => $challenge->id,
                'purpose' => 'email_verification',
                'expires_at' => $challenge->expires_at->toIso8601String(),
                'resend_available_at' => $challenge->resend_available_at?->toIso8601String(),
            ],
        ], 201);
    }

    public function resend(string $id): JsonResponse
    {
        $challenge = RegistrationChallenge::query()->findOrFail($id);
        $this->registrations->resend($challenge);

        return response()->json([
            'success' => true,
            'message' => 'If delivery is available, a new verification code has been sent.',
        ]);
    }

    public function verify(VerifyRegistrationRequest $request, string $id): JsonResponse
    {
        $challenge = RegistrationChallenge::query()->findOrFail($id);
        $user = $this->registrations->verify($challenge, $request->validated('code'));
        $membership = $user->memberships()->with('organization')->where('status', 'active')->latest('id')->firstOrFail();
        $organization = $membership->organization;

        $userPayload = $this->auth->establishBrowserSession($request, $user, 'registration+email');

        return response()->json([
            'success' => true,
            'status' => 'authenticated',
            'user' => $userPayload,
            'organization' => [
                'id' => (string) $organization->id,
                'name' => $organization->name,
                'slug' => $organization->slug,
            ],
            'next' => '/onboarding',
        ]);
    }
}
