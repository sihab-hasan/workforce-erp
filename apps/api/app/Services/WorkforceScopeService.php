<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;

class WorkforceScopeService
{
    public function __construct(private readonly OrganizationAccessService $access) {}

    public function organization(Request $request, bool $required = true): ?Organization
    {
        $existing = $request->attributes->get('workforce.organization');
        if ($existing instanceof Organization) {
            return $existing;
        }

        $user = $request->user();
        if (! $user instanceof User) {
            if ($required) {
                throw new AuthorizationException('Authentication is required.');
            }
            return null;
        }

        $key = trim((string) $request->header('X-Tenant-Key', ''));
        $organizationIds = $this->access->organizationIds($user);
        if ($organizationIds === []) {
            throw new AuthorizationException('No active organization membership was found.');
        }

        $query = Organization::query()->whereIn('id', $organizationIds)->where('status', 'active');
        if ($key !== '') {
            $query->where(function ($q) use ($key) {
                if (ctype_digit($key)) {
                    $q->whereKey((int) $key)->orWhere('slug', $key);
                } else {
                    $q->where('slug', $key)->orWhere('subdomain', $key);
                }
            });
        } elseif ($required) {
            // Backwards-compatible fallback for non-route API clients. Browser ERP always sends the header.
            $query->orderBy('id');
        } else {
            return null;
        }

        $organization = $query->first();
        if (! $organization) {
            throw new AuthorizationException('The selected organization is not accessible.');
        }

        $request->attributes->set('workforce.organization', $organization);
        $request->attributes->set('workforce.role', $this->access->activeRole($user, (int) $organization->id));

        return $organization;
    }

    public function branch(Request $request, bool $required = false): ?Branch
    {
        $existing = $request->attributes->get('workforce.branch');
        if ($existing instanceof Branch) {
            return $existing;
        }

        $organization = $this->organization($request, true);
        $key = trim((string) $request->header('X-Company-Key', ''));
        if ($key === '') {
            if ($required) {
                abort(422, 'A company scope is required for this action.');
            }
            return null;
        }

        $branch = Branch::query()
            ->where('organization_id', $organization->id)
            ->where('is_active', true)
            ->where(function ($q) use ($key) {
                if (ctype_digit($key)) {
                    $q->whereKey((int) $key)->orWhere('code', $key);
                } else {
                    $q->where('code', $key)->orWhere('name', $key);
                }
            })
            ->first();

        if (! $branch) {
            throw new AuthorizationException('The selected company is not accessible.');
        }

        $request->attributes->set('workforce.branch', $branch);
        return $branch;
    }

    /** @param array<int,string> $roles */
    public function assertRole(Request $request, array $roles, string $message = 'You do not have permission to perform this action.'): string
    {
        $organization = $this->organization($request, true);
        $role = $this->access->activeRole($request->user(), (int) $organization->id);
        if (! $role || ! in_array($role, $roles, true)) {
            throw new AuthorizationException($message);
        }
        return $role;
    }

    public function role(Request $request): ?string
    {
        $organization = $this->organization($request, false);
        return $organization ? $this->access->activeRole($request->user(), (int) $organization->id) : null;
    }
}
