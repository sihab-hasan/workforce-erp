<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\Services\InvitationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class InvitationController extends Controller
{
    public function __construct(
        private readonly InvitationService $invitations,
        private readonly AuthService $auth,
    ) {}

    public function show(string $token): JsonResponse
    {
        $invitation = $this->invitations->preview($token);
        $user = $invitation->membership->user;

        return response()->json([
            'success' => true,
            'data' => [
                'email' => $invitation->email,
                'organization' => [
                    'id' => (string) $invitation->organization_id,
                    'name' => $invitation->organization->name,
                ],
                'expires_at' => $invitation->expires_at->toIso8601String(),
                'identity_setup_required' => $user->password_initialized_at === null,
            ],
        ]);
    }

    public function accept(Request $request, string $token): JsonResponse
    {
        $invitation = $this->invitations->preview($token);
        $user = $invitation->membership->user;
        $newIdentity = $user->password_initialized_at === null;

        if ($newIdentity) {
            $data = $request->validate([
                'password' => ['required', 'confirmed', Password::min(12)->uncompromised()],
            ]);

            // Possession of the single-use invitation token proves control of
            // the exact invited mailbox. It does not activate any other invite.
            $user->forceFill([
                'password' => Hash::make($data['password']),
                'password_initialized_at' => now(),
                'email_verified_at' => $user->email_verified_at ?: now(),
            ])->save();
        } elseif (! $request->user() || (int) $request->user()->id !== (int) $user->id) {
            abort(401, 'Sign in with the invited email before accepting this invitation.');
        }

        $membership = $this->invitations->accept($token, $user);
        $organization = [
            'id' => (string) $membership->organization_id,
            'slug' => $membership->organization->slug,
            'name' => $membership->organization->name,
        ];

        if (! $newIdentity) {
            return response()->json([
                'success' => true,
                'status' => 'accepted',
                'user' => $this->auth->userPayload($user, (int) $membership->organization_id),
                'organization' => $organization,
            ]);
        }

        // Never bypass privileged MFA merely because the invitation token was
        // valid. The membership is accepted atomically, then normal sign-in
        // policy decides whether a full application session may be created.
        $authentication = $this->auth->beginBrowserAuthentication($request, $user, 'invitation+email');

        return response()->json([
            ...$authentication,
            'organization' => $organization,
        ]);
    }
}
