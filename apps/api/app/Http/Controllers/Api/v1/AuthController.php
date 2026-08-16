<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\AuthService;
use App\Services\PasswordService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly PasswordService $passwordService
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->authService->authenticatePassword($request->validated());

        return response()->json([
            'success' => true,
            'user' => $this->authService->establishBrowserSession($request, $user),
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->passwordService->sendResetLink($request->validated('email'));

        return response()->json(['success' => true, 'message' => 'If the account is eligible and email delivery is available, a password reset link will arrive shortly.']);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $this->passwordService->reset($request->validated());

        return response()->json(['success' => true, 'message' => 'Password reset successfully. Please sign in again.']);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $wasBrowserSession = ! $this->authService->usesPersonalAccessToken($request->user());
        $this->passwordService->change($request->user(), $validated['current_password'], $validated['password']);
        if ($wasBrowserSession) {
            $this->authService->logoutBrowserSession($request);
        }

        return response()->json(['success' => true, 'message' => 'Password changed successfully. Please sign in again.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['success' => true, 'user' => $this->authService->userPayload($request->user())]);
    }

    public function sessions(Request $request): JsonResponse
    {
        if ($this->authService->usesPersonalAccessToken($request->user())) {
            $currentTokenId = $request->user()->currentAccessToken()->getKey();
            $data = $request->user()->tokens()->orderByDesc('last_used_at')->orderByDesc('created_at')->get()->map(fn ($token) => [
                'id' => (string) $token->id,
                'name' => $token->name,
                'created_at' => $token->created_at?->toIso8601String(),
                'last_used_at' => $token->last_used_at?->toIso8601String(),
                'expires_at' => $token->expires_at?->toIso8601String(),
                'current' => (int) $token->id === (int) $currentTokenId,
                'kind' => 'api_token',
            ])->values();
        } else {
            $data = $this->authService->browserSessions($request, $request->user());
        }

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function revokeSession(Request $request, string $sessionId): JsonResponse
    {
        if ($this->authService->usesPersonalAccessToken($request->user())) {
            $deleted = $request->user()->tokens()->whereKey($sessionId)->delete();
            if ($deleted === 0) {
                abort(404, 'Session not found.');
            }
        } else {
            $isCurrent = hash_equals($request->session()->getId(), $sessionId);
            if ($isCurrent) {
                $this->authService->logoutBrowserSession($request);
            } elseif (! $this->authService->revokeBrowserSession($request->user(), $sessionId)) {
                abort(404, 'Session not found or this session backend cannot revoke other browser sessions.');
            }
        }

        return response()->json(['success' => true, 'message' => 'Session revoked.']);
    }

    public function logout(Request $request): JsonResponse
    {
        // Bearer-token clients may still use auth:sanctum on API-only integrations.
        if ($request->user() && $this->authService->usesPersonalAccessToken($request->user())) {
            $request->user()->currentAccessToken()->delete();
        } else {
            $this->authService->logoutBrowserSession($request);
        }

        return response()->json(['success' => true, 'message' => 'Logged out successfully.']);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->tokens()->delete();
        $this->authService->revokeAllBrowserSessions($user);
        if (! $this->authService->usesPersonalAccessToken($user) && $request->hasSession()) {
            $this->authService->logoutBrowserSession($request);
        }

        return response()->json(['success' => true, 'message' => 'All sessions have been logged out.']);
    }
}
