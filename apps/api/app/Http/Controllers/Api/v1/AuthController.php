<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\AuthService;
use App\Services\PasswordService;
use App\Services\SessionSecurityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $auth,
        private readonly PasswordService $passwords,
        private readonly SessionSecurityService $sessions,
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        return response()->json(
            $this->auth->beginBrowserAuthentication(
                $request,
                $this->auth->authenticatePassword($request->validated()),
                'password',
            ),
        );
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->passwords->sendResetLink($request->validated('email'));

        return response()->json([
            'success' => true,
            'message' => 'If the account is eligible, password reset instructions will arrive shortly.',
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $this->passwords->reset($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully. Please sign in again.',
        ]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->sessions->requireRecentVerification($request);
        $data = $request->validated();
        $this->passwords->change($request->user(), $data['current_password'], $data['password']);
        $this->auth->logoutBrowserSession($request);

        return response()->json([
            'success' => true,
            'message' => 'Password changed. Please sign in again.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $context = $this->auth->context($request);

        return response()->json([
            'success' => true,
            'data' => $context,
            'user' => $context['user'],
        ]);
    }

    public function sessions(Request $request): JsonResponse
    {
        $browser = $this->auth->browserSessions($request, $request->user());
        if ($browser !== []) {
            return response()->json([
                'success' => true,
                'data' => $browser,
            ]);
        }

        $tokens = $request->user()->tokens()->get()->map(fn ($t) => [
            'id' => (string) $t->id,
            'name' => $t->name,
            'last_used_at' => $t->last_used_at?->toISOString(),
            'created_at' => $t->created_at?->toISOString(),
            'current' => $request->user()->currentAccessToken()?->id === $t->id,
            'kind' => 'api_token',
        ])->values()->all();

        return response()->json([
            'success' => true,
            'data' => $tokens,
        ]);
    }

    public function revokeSession(Request $request, string $id): JsonResponse
    {
        if ($request->hasSession() && hash_equals($request->session()->getId(), $id)) {
            $this->auth->logoutBrowserSession($request);

            return response()->json(['success' => true]);
        }
        if ($this->auth->revokeBrowserSession($request->user(), $id)) {
            return response()->json(['success' => true]);
        }
        $token = $request->user()->tokens()->where('id', $id)->first();
        if ($token) {
            $token->delete();

            return response()->json(['success' => true]);
        }
        abort(404, 'Session not found.');
    }

    public function revokeAllOthers(Request $request): JsonResponse
    {
        $current = $request->session()->getId();
        DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->where('id', '!=', $current)
            ->delete();

        return response()->json([
            'success' => true,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();
        $this->auth->logoutBrowserSession($request);

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $this->sessions->revokeAll($request->user());
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'success' => true,
        ]);
    }
}
