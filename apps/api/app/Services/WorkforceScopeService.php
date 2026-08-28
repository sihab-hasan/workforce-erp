<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\Organization;
use Illuminate\Http\Request;

class WorkforceScopeService
{
    public function __construct(
        private readonly AuthorizationService $authorization,
    ) {}

    public function organization(Request $request, bool $required = true): ?Organization
    {
        $existing = $request->attributes->get('workforce.organization');
        if ($existing instanceof Organization) {
            return $existing;
        }

        $key = trim((string) ($request->header('X-Tenant-Key') ?: $request->header('X-Company-Key') ?: $request->input('organization_id') ?: ''));
        if ($key === '' && $request->user()) {
            $hasActive = $request->user()->memberships()->where('status', 'active')->exists();
            if (! $hasActive) {
                abort(401, 'This account does not have active Workforce access.');
            }
            $firstOrg = $request->user()->organizations()->where('organizations.status', 'active')->first();
            if ($firstOrg) {
                $membership = $this->authorization->activeMembership($request->user(), (int) $firstOrg->id);
                if ($membership) {
                    $request->attributes->set('workforce.organization', $firstOrg);
                    $request->attributes->set('workforce.membership', $membership);

                    return $firstOrg;
                }
            }
        }

        if ($key === '') {
            if ($required) {
                abort(400, 'X-Tenant-Key is required for this business endpoint.');
            }

            return null;
        }

        $org = Organization::query()
            ->where(fn ($query) => $query->where('slug', $key)->orWhere('id', ctype_digit($key) ? (int) $key : 0))
            ->where('status', 'active')
            ->first();

        if (! $org) {
            abort(404, 'Organization not found.');
        }

        $membership = $this->authorization->activeMembership($request->user(), (int) $org->id);
        if (! $membership) {
            abort(403, 'You do not have active access to this organization.');
        }

        $request->attributes->set('workforce.organization', $org);
        $request->attributes->set('workforce.membership', $membership);

        return $org;
    }

    public function branch(Request $request, bool $required = true): ?Branch
    {
        $org = $this->organization($request, $required);
        if (! $org) {
            return null;
        }

        $key = trim((string) $request->header('X-Company-Key', ''));
        if ($key === '') {
            if ($required) {
                abort(400, 'X-Company-Key is required for this endpoint.');
            }

            return null;
        }

        $branch = Branch::query()
            ->where('organization_id', $org->id)
            ->where(fn ($query) => $query->where('code', $key)->orWhere('id', ctype_digit($key) ? (int) $key : 0))
            ->where('is_active', true)
            ->first();

        if (! $branch) {
            abort(404, 'Company/branch not found.');
        }

        $request->attributes->set('workforce.branch', $branch);

        return $branch;
    }

    public function authorize(Request $request, string $permission, string $message = 'You do not have permission to perform this action.'): void
    {
        $org = $this->organization($request, true);
        $this->authorization->authorize($request->user(), (int) $org->id, $permission, $message);
    }

    public function role(Request $request): ?string
    {
        $org = $this->organization($request, false);

        return $org ? ($this->authorization->roles($request->user(), (int) $org->id)[0] ?? null) : null;
    }
}
