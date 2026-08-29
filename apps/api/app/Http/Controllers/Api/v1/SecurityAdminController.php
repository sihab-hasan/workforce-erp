<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AccessRequestService;
use App\Services\AuthorizationService;
use App\Services\DomainVerificationService;
use App\Services\ServiceAccountService;
use App\Services\SessionSecurityService;
use App\Services\SodService;
use App\Services\WorkforceScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SecurityAdminController extends Controller
{
    public function __construct(
        private readonly WorkforceScopeService $scope,
        private readonly DomainVerificationService $domains,
        private readonly ServiceAccountService $services,
        private readonly SessionSecurityService $sessions,
        private readonly AuthorizationService $authz,
        private readonly SodService $sod,
        private readonly AccessRequestService $accessRequests,
    ) {}

    public function createDomain(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $data = $request->validate([
            'domain' => ['required', 'string', 'max:255'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->domains->create($request->user(), $org->id, $data['domain']),
        ], 201);
    }

    public function verifyDomain(Request $request, int $id): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $data = $request->validate([
            'token' => ['required', 'string', 'max:255'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->domains->verify($request->user(), $org->id, $id, $data['token']),
        ]);
    }

    public function createServiceAccount(Request $request): JsonResponse
    {
        $this->sessions->requireRecentVerification($request);
        $org = $this->scope->organization($request, true);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['string', 'max:120'],
            'scopes' => ['required', 'array', 'min:1'],
            'scopes.*.scope' => ['required', 'string'],
            'scopes.*.data' => ['nullable', 'array'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->services->create(
                $request->user(),
                $org->id,
                $data['name'],
                $data['permissions'],
                $data['scopes'],
                $data['expires_at'] ?? null,
            ),
        ], 201);
    }

    public function rotateServiceAccount(Request $request, int $id): JsonResponse
    {
        $this->sessions->requireRecentVerification($request);
        $org = $this->scope->organization($request, true);

        return response()->json([
            'success' => true,
            'data' => $this->services->rotate($request->user(), $org->id, $id),
        ]);
    }

    public function revokeServiceAccount(Request $request, int $id): JsonResponse
    {
        $this->sessions->requireRecentVerification($request);
        $org = $this->scope->organization($request, true);
        $this->services->revoke($request->user(), $org->id, $id);

        return response()->json([
            'success' => true,
        ]);
    }

    public function accessRequests(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $this->authz->authorize($request->user(), $org->id, 'access_request.approve');

        return response()->json([
            'success' => true,
            'data' => DB::table('access_requests')
                ->where('organization_id', $org->id)
                ->orderByDesc('created_at')
                ->paginate(50),
        ]);
    }

    public function requestAccess(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $data = $request->validate([
            'role_id' => ['required', 'integer'],
            'scope' => ['required', 'in:OWN,DIRECT_REPORTS,TEAM,DEPARTMENT,BRANCH,COMPANY,BUSINESS_UNIT,ORGANIZATION,GLOBAL'],
            'scope_data' => ['nullable', 'array'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        $id = $this->accessRequests->create(
            $request->user(),
            $org->id,
            (int) $data['role_id'],
            $data['scope'],
            $data['scope_data'] ?? null,
            $data['expires_at'] ?? null,
        );

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $id,
                'status' => 'pending_manager',
            ],
        ], 201);
    }

    public function approveAccess(Request $request, string $id): JsonResponse
    {
        $this->sessions->requireRecentVerification($request);
        $org = $this->scope->organization($request, true);

        return response()->json([
            'success' => true,
            'data' => $this->accessRequests->approve($request->user(), $org->id, $id),
        ]);
    }

    public function rejectAccess(Request $request, string $id): JsonResponse
    {
        $this->sessions->requireRecentVerification($request);
        $org = $this->scope->organization($request, true);
        $data = $request->validate([
            'reason' => ['required', 'string', 'min:10', 'max:1000'],
        ]);

        $this->accessRequests->reject($request->user(), $org->id, $id, $data['reason']);

        return response()->json([
            'success' => true,
        ]);
    }

    public function sodConflicts(Request $request, int $userId): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $this->authz->authorize($request->user(), $org->id, 'security.manage');
        $target = User::findOrFail($userId);

        return response()->json([
            'success' => true,
            'data' => $this->sod->conflicts($target, $org->id),
        ]);
    }

    public function createSodOverride(Request $request): JsonResponse
    {
        $this->sessions->requireRecentVerification($request);
        $org = $this->scope->organization($request, true);

        $data = $request->validate([
            'rule_id' => ['required', 'integer'],
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'mitigation' => ['required', 'string', 'min:20', 'max:1000'],
            'reason' => ['required', 'string', 'min:10', 'max:1000'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        $id = $this->sod->createOverride(
            $request->user(),
            $org->id,
            (int) $data['rule_id'],
            User::findOrFail($data['user_id']),
            $data['mitigation'],
            $data['reason'],
            $data['expires_at'] ?? null,
        );

        return response()->json([
            'success' => true,
            'data' => [
                'id' => (string) $id,
            ],
        ], 201);
    }

    public function revokeSodOverride(Request $request, int $id): JsonResponse
    {
        $this->sessions->requireRecentVerification($request);
        $org = $this->scope->organization($request, true);
        $this->sod->revokeOverride($request->user(), $org->id, $id);

        return response()->json([
            'success' => true,
        ]);
    }
}
