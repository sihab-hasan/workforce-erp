<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Services\OrganizationAccessService;
use App\Services\WorkforceScopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrganizationController extends Controller
{
    public function __construct(
        private readonly OrganizationAccessService $access,
        private readonly WorkforceScopeService $scope,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $memberships = $request->user()->memberships()
            ->with('organization')
            ->where('status', 'active')
            ->orderBy('organization_id')
            ->get();

        $data = $memberships->filter(fn ($membership) => $membership->organization)
            ->map(fn ($membership) => $this->serialize($membership->organization, $membership->role))
            ->values();

        return $this->successResponse($data);
    }

    public function current(Request $request): JsonResponse
    {
        $organization = $this->scope->organization($request, true);
        return $this->successResponse($this->serialize($organization, $this->scope->role($request), true));
    }

    public function show(Request $request, Organization $organization): JsonResponse
    {
        $this->access->assertCanManage($request->user(), (int) $organization->id, ['owner', 'admin', 'manager', 'staff', 'readonly'], 'You do not have access to this organization.');
        return $this->successResponse($this->serialize($organization, $this->access->activeRole($request->user(), (int) $organization->id), true));
    }

    public function update(Request $request, Organization $organization): JsonResponse
    {
        $this->access->assertCanManage($request->user(), (int) $organization->id, ['owner', 'admin']);
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
        return $this->successResponse($this->serialize($organization->fresh(), $this->access->activeRole($request->user(), (int) $organization->id), true), 'Organization updated successfully');
    }

    private function serialize(Organization $organization, ?string $role, bool $withStats = false): array
    {
        $data = [
            'id' => (string) $organization->id,
            'name' => $organization->name,
            'legal_name' => $organization->legal_name,
            'slug' => $organization->slug,
            'subdomain' => $organization->subdomain,
            'email' => $organization->email,
            'phone' => $organization->phone,
            'address' => $organization->address,
            'timezone' => $organization->timezone,
            'locale' => $organization->locale,
            'settings' => $organization->settings ?? [],
            'status' => $organization->status,
            'role' => $role,
        ];
        if ($withStats) {
            $data['stats'] = [
                'companies' => $organization->branches()->count(),
                'departments' => $organization->departments()->count(),
                'employees' => $organization->employees()->count(),
                'users' => $organization->memberships()->where('status', 'active')->count(),
            ];
        }
        return $data;
    }
}
