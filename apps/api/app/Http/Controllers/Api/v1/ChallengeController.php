<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SelectChallengeMethodRequest;
use App\Http\Requests\Auth\VerifyChallengeRequest;
use App\Models\VerificationChallenge;
use App\Services\AuthService;
use App\Services\SessionSecurityService;
use App\Services\VerificationChallengeService;
use Illuminate\Http\JsonResponse;

class ChallengeController extends Controller
{
    public function __construct(
        private readonly VerificationChallengeService $challenges,
        private readonly AuthService $auth,
        private readonly SessionSecurityService $sessions,
    ) {}

    public function select(SelectChallengeMethodRequest $request, string $id): JsonResponse
    {
        $challenge = $this->challenges->selectAndSend(
            VerificationChallenge::query()->findOrFail($id),
            $request->validated('method'),
        );

        return response()->json([
            'success' => true,
            'challenge' => $this->auth->challengePayload($challenge),
        ]);
    }

    public function resend(string $id): JsonResponse
    {
        $challenge = $this->challenges->resend(
            VerificationChallenge::query()->findOrFail($id),
        );

        return response()->json([
            'success' => true,
            'challenge' => $this->auth->challengePayload($challenge),
        ]);
    }

    public function verify(VerifyChallengeRequest $request, string $id): JsonResponse
    {
        $purpose = $request->validated('purpose');

        if ($purpose === 'login') {
            return response()->json([
                'success' => true,
                'status' => 'authenticated',
                'user' => $this->auth->finalizeLoginChallenge($request, $id, $request->validated('code')),
            ]);
        }

        $challenge = VerificationChallenge::query()->with('user')->findOrFail($id);

        if (! $request->user() || (int) $request->user()->id !== (int) $challenge->user_id) {
            abort(403, 'Challenge does not belong to this session.');
        }

        $verification = $this->challenges->verify($challenge, $purpose, $request->validated('code'));

        if ($purpose === 'step_up') {
            $this->sessions->markStepUp($request);
        }

        return response()->json([
            'success' => true,
            'status' => 'verified',
            'authentication_method' => $verification['authentication_method'],
        ]);
    }
}
