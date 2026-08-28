<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Services\AuthorizationService;
use App\Services\DataScopeService;
use App\Services\WorkforceScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrganizationController extends Controller
{
    public function __construct(
        private readonly AuthorizationService $authz,
        private readonly DataScopeService $dataScope,
        private readonly WorkforceScopeService $scope,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $memberships = $request->user()
            ->memberships()
            ->with('organization')
            ->where('status', 'active')
            ->orderBy('organization_id')
            ->get();

        $data = $memberships
            ->filter(fn ($membership) => $membership->organization && $this->authz->can($request->user(), (int) $membership->organization_id, 'organization.view'))
            ->map(fn ($membership) => $this->serialize($membership->organization, $this->authz->roles($request->user(), (int) $membership->organization_id), $request->user(), false))
            ->values();

        return $this->successResponse($data);
    }

    public function current(Request $request): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        $this->authz->authorize($request->user(), (int) $org->id, 'organization.view');

        return $this->successResponse($this->serialize($org, $this->authz->roles($request->user(), (int) $org->id), $request->user(), true));
    }

    public function show(Request $request, Organization $organization): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        abort_unless((int) $organization->id === (int) $org->id, 404);
        $this->authz->authorize($request->user(), (int) $org->id, 'organization.view');

        return $this->successResponse($this->serialize($organization, $this->authz->roles($request->user(), (int) $org->id), $request->user(), true));
    }

    public function update(Request $request, Organization $organization): JsonResponse
    {
        $org = $this->scope->organization($request, true);
        abort_unless((int) $organization->id === (int) $org->id, 404);
        $this->authz->authorize($request->user(), (int) $org->id, 'organization.manage');

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'legal_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:120', Rule::unique('organizations', 'slug')->ignore($organization->id)],
            'subdomain' => ['sometimes', 'nullable', 'string', 'max:120', Rule::unique('organizations', 'subdomain')->ignore($organization->id)],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'address' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'timezone' => ['sometimes', 'string', 'timezone'],
            'locale' => ['sometimes', 'string', 'max:16'],
            'settings' => ['sometimes', 'nullable', 'array'],
        ]);

        $organization->update($data);

        return $this->successResponse(
            $this->serialize($organization->fresh(), $this->authz->roles($request->user(), (int) $org->id), $request->user(), true),
            'Organization updated successfully',
        );
    }

    private function serialize(Organization $org, array $roles, $user, bool $stats = false): array
    {
        $data = [
            'id' => (string) $org->id,
            'name' => $org->name,
            'legal_name' => $org->legal_name,
            'slug' => $org->slug,
            'subdomain' => $org->subdomain,
            'email' => $org->email,
            'phone' => $org->phone,
            'address' => $org->address,
            'timezone' => $org->timezone,
            'locale' => $org->locale,
            'settings' => $org->settings ?? [],
            'status' => $org->status,
            'onboarding_status' => $org->onboarding_status ?? 'completed',
            'onboarding_step' => $org->onboarding_step ?? 'organization',
            'roles' => $roles,
            'role' => $roles[0] ?? null,
        ];

        if ($stats) {
            $employeeQuery = $org->employees()->getQuery();
            $this->dataScope->applyEmployeeScope($employeeQuery, $user, (int) $org->id);
            $data['stats'] = [
                'companies' => $this->dataScope->isOrganizationWide($user, (int) $org->id)
                    ? $org->branches()->count()
                    : count($this->dataScope->accessibleBranchIds($user, (int) $org->id) ?? []),
                'departments' => $this->dataScope->isOrganizationWide($user, (int) $org->id)
                    ? $org->departments()->count()
                    : count($this->dataScope->accessibleDepartmentIds($user, (int) $org->id) ?? []),
                'employees' => $employeeQuery->count(),
                'users' => $this->authz->can($user, (int) $org->id, 'user.view')
                    ? $org->memberships()->where('status', 'active')->count()
                    : null,
            ];
        }

        return $data;
    }
}
