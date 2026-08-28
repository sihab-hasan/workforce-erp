<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\Services\SessionSecurityService;
use App\Services\TotpService;
use App\Services\VerificationChallengeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SecurityController extends Controller
{
    public function __construct(
        private readonly TotpService $totp,
        private readonly VerificationChallengeService $challenges,
        private readonly AuthService $auth,
        private readonly SessionSecurityService $sessions,
    ) {}

    public function context(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->auth->context($request),
        ]);
    }

    public function beginStepUp(Request $request): JsonResponse
    {
        $challenge = $this->challenges->create(
            $request->user(),
            'step_up',
            (string) $request->session()->get('authentication_method', 'session'),
            (string) $request->session()->get('client', 'erp'),
        );

        return response()->json([
            'success' => true,
            'challenge' => $this->auth->challengePayload($challenge),
        ]);
    }

    public function authenticators(Request $request): JsonResponse
    {
        $factors = $request->user()
            ->authenticatorFactors()
            ->whereNotNull('confirmed_at')
            ->orderBy('id')
            ->get()
            ->map(fn ($factor) => [
                'id' => (string) $factor->id,
                'label' => $factor->label,
                'confirmed_at' => $factor->confirmed_at?->toIso8601String(),
            ])
            ->values();

        return response()->json([
            'success' => true,
            'data' => $factors,
        ]);
    }

    public function beginAuthenticator(Request $request): JsonResponse
    {
        $this->sessions->requireRecentVerification($request);
        $secret = $this->totp->generateSecret();
        $factor = $request->user()->authenticatorFactors()->create([
            'secret' => $secret,
            'label' => 'Authenticator App',
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'factor_id' => (string) $factor->id,
                'secret' => $secret,
                'otpauth_uri' => $this->totp->uri($secret, $request->user()->email),
            ],
        ]);
    }

    public function confirmAuthenticator(Request $request, int $factorId): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'regex:/^\d{6}$/'],
        ]);

        $factor = $request->user()
            ->authenticatorFactors()
            ->whereKey($factorId)
            ->whereNull('confirmed_at')
            ->firstOrFail();

        if (! $this->totp->verify($factor->secret, $data['code'])) {
            abort(400, 'Invalid authenticator code.');
        }

        $factor->forceFill(['confirmed_at' => now()])->save();

        return response()->json([
            'success' => true,
            'message' => 'Authenticator App enabled.',
        ]);
    }

    public function removeAuthenticator(Request $request, int $factorId): JsonResponse
    {
        $this->sessions->requireRecentVerification($request);
        $user = $request->user();

        $factor = $user->authenticatorFactors()
            ->whereKey($factorId)
            ->whereNotNull('confirmed_at')
            ->firstOrFail();

        if ($user->authenticatorFactors()->whereNotNull('confirmed_at')->count() === 1 &&
            $this->auth->requiresMfa($user) &&
            ! $user->email_verified_at &&
            ! $user->phone_verified_at
        ) {
            abort(409, 'Enroll another valid verification method before removing the last required factor.');
        }

        $factor->delete();
        $user->increment('auth_version');
        $this->sessions->revokeAll($user);

        return response()->json([
            'success' => true,
            'message' => 'Authenticator App removed. Sign in again.',
        ]);
    }
}
