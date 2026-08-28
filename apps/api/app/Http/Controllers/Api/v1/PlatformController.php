<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\SecurityAuditEvent;
use App\Models\User;
use App\Services\AuthorizationService;
use App\Services\BreakGlassService;
use App\Services\ImpersonationService;
use App\Services\SessionSecurityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlatformController extends Controller
{
    public function __construct(
        private readonly AuthorizationService $authz,
        private readonly SessionSecurityService $sessions,
        private readonly ImpersonationService $impersonation,
        private readonly BreakGlassService $breakGlass,
    ) {}

    public function context(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => (string) $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                ],
                'platform_roles' => $this->authz->platformRoles($request->user()),
                'permissions' => $this->authz->platformPermissions($request->user()),
                'session' => [
                    'authentication_method' => $request->session()->get('authentication_method'),
                    'mfa_level' => $request->session()->get('mfa_level'),
                    'recent_verified_at' => $request->session()->get('recent_verified_at'),
                ],
                'impersonation_id' => $request->session()->get('impersonation_id'),
            ],
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $this->authz->authorizePlatform($request->user(), 'platform.users.read');

        return response()->json([
            'success' => true,
            'data' => User::query()->select('id', 'name', 'email', 'status', 'last_login_at')->paginate(50),
        ]);
    }

    public function organizations(Request $request): JsonResponse
    {
        $this->authz->authorizePlatform($request->user(), 'platform.organizations.read');

        return response()->json([
            'success' => true,
            'data' => Organization::query()->select('id', 'name', 'slug', 'status', 'subscription_status')->paginate(50),
        ]);
    }

    public function audit(Request $request): JsonResponse
    {
        $this->authz->authorizePlatform($request->user(), 'platform.audit.read');

        return response()->json([
            'success' => true,
            'data' => SecurityAuditEvent::query()->latest('id')->paginate(100),
        ]);
    }

    public function startImpersonation(Request $request): JsonResponse
    {
        $this->authz->authorizePlatform($request->user(), 'platform.impersonation.start');
        $this->sessions->requireRecentVerification($request);

        $data = $request->validate([
            'subject_user_id' => ['required', 'integer', 'exists:users,id'],
            'organization_id' => ['required', 'integer', 'exists:organizations,id'],
            'support_ticket' => ['required', 'string', 'max:191'],
            'reason' => ['required', 'string', 'min:10', 'max:1000'],
            'minutes' => ['nullable', 'integer', 'min:5', 'max:60'],
        ]);

        $result = $this->impersonation->start(
            $request,
            $request->user(),
            (int) $data['subject_user_id'],
            (int) $data['organization_id'],
            $data['support_ticket'],
            $data['reason'],
            (int) ($data['minutes'] ?? 30),
            (array) config('security.impersonation.restricted_actions', []),
        );

        return response()->json([
            'success' => true,
            'data' => $result,
        ], 201);
    }

    public function endImpersonation(Request $request, string $id): JsonResponse
    {
        $this->authz->authorizePlatform($request->user(), 'platform.impersonation.end');
        $this->impersonation->end($request, $request->user(), $id);

        return response()->json([
            'success' => true,
        ]);
    }

    public function startBreakGlass(Request $request): JsonResponse
    {
        $this->authz->authorizePlatform($request->user(), 'platform.break_glass.start');
        $this->sessions->requireRecentVerification($request);

        $data = $request->validate([
            'organization_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'reason' => ['required', 'string', 'min:20', 'max:1000'],
            'minutes' => ['required', 'integer', 'min:5', 'max:60'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->breakGlass->start(
                $request->user(),
                isset($data['organization_id']) ? (int) $data['organization_id'] : null,
                $data['reason'],
                (int) $data['minutes'],
                $request->user()->id,
            ),
        ], 201);
    }

    public function endBreakGlass(Request $request, string $id): JsonResponse
    {
        $this->authz->authorizePlatform($request->user(), 'platform.break_glass.start');
        $this->breakGlass->end($request->user(), $id);

        return response()->json([
            'success' => true,
        ]);
    }

    public function reviewBreakGlass(Request $request, string $id): JsonResponse
    {
        $this->authz->authorizePlatform($request->user(), 'platform.break_glass.review');
        $data = $request->validate([
            'note' => ['required', 'string', 'min:20', 'max:2000'],
        ]);

        $this->breakGlass->review($request->user(), $id, $data['note']);

        return response()->json([
            'success' => true,
        ]);
    }
}
