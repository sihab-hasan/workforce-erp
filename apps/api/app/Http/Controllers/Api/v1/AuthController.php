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
use Laravel\Sanctum\PersonalAccessToken;

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

        $currentToken = $request->user()->currentAccessToken();
        $tokens = $request->user()->tokens()->get()->map(fn ($t) => [
            'id' => (string) $t->id,
            'name' => $t->name,
            'last_used_at' => $t->last_used_at?->toISOString(),
            'created_at' => $t->created_at?->toISOString(),
            'current' => ($currentToken instanceof PersonalAccessToken) && $currentToken->id === $t->id,
            'kind' => 'api_token',
        ])->values()->all();

        return response()->json([
            'success' => true,
            'data' => $tokens,
        ]);
    }

    public function revokeSession(Request $request, ?string $sessionId = null, ?string $id = null): JsonResponse
    {
        $targetId = $sessionId ?? $id ?? (string) $request->route('sessionId') ?? (string) $request->route('id');

        if ($request->hasSession() && hash_equals($request->session()->getId(), $targetId)) {
            $this->auth->logoutBrowserSession($request);

            $cookieName = config('session.cookie');
            $cookieDomain = config('session.domain');
            $cookiePath = config('session.path', '/');

            return response()->json(['success' => true])
                ->withCookie(cookie()->forget($cookieName, $cookiePath, $cookieDomain))
                ->withCookie(cookie()->forget('XSRF-TOKEN', $cookiePath, $cookieDomain));
        }
        if ($this->auth->revokeBrowserSession($request->user(), $targetId)) {
            return response()->json(['success' => true]);
        }
        $token = $request->user()->tokens()->where('id', $targetId)->first();
        if ($token) {
            $token->delete();

            return response()->json(['success' => true]);
        }
        abort(404, 'Session not found.');
    }

    public function revokeAllOthers(Request $request): JsonResponse
    {
        $current = $request->hasSession() ? $request->session()->getId() : null;
        $query = DB::table('sessions')->where('user_id', $request->user()->id);
        if ($current) {
            $query->where('id', '!=', $current);
        }
        $query->delete();

        $currentToken = $request->user()?->currentAccessToken();
        if ($currentToken instanceof PersonalAccessToken) {
            $request->user()->tokens()->where('id', '!=', $currentToken->id)->delete();
        }

        return response()->json([
            'success' => true,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $currentToken = $request->user()?->currentAccessToken();
        if ($currentToken instanceof PersonalAccessToken) {
            $currentToken->delete();
        }
        $this->auth->logoutBrowserSession($request);

        $cookieName = config('session.cookie');
        $cookieDomain = config('session.domain');
        $cookiePath = config('session.path', '/');

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ])
        ->withCookie(cookie()->forget($cookieName, $cookiePath, $cookieDomain))
        ->withCookie(cookie()->forget('XSRF-TOKEN', $cookiePath, $cookieDomain));
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            $this->sessions->revokeAll($user);
            $user->tokens()->delete();
        }
        $this->auth->logoutBrowserSession($request);

        $cookieName = config('session.cookie');
        $cookieDomain = config('session.domain');
        $cookiePath = config('session.path', '/');

        return response()->json([
            'success' => true,
        ])
        ->withCookie(cookie()->forget($cookieName, $cookiePath, $cookieDomain))
        ->withCookie(cookie()->forget('XSRF-TOKEN', $cookiePath, $cookieDomain));
    }
}
