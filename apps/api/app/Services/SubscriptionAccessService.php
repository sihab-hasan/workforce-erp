<?php

namespace App\Services;

use App\Models\Organization;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class SubscriptionAccessService
{
    public function tenantUsable(Organization $organization): bool
    {
        $status = (string) $organization->subscription_status;
        if (in_array($status, ['active', 'trialing'], true)) {
            return true;
        }
        if ($status === 'grace' && $organization->grace_period_ends_at && now()->lte($organization->grace_period_ends_at)) {
            return true;
        }

        return false;
    }

    public function assertTenantUsable(Organization $organization): void
    {
        if (! $this->tenantUsable($organization)) {
            throw new AuthorizationException('This organization subscription does not currently permit ERP access.');
        }
    }

    public function moduleEnabled(Organization $organization, string $module): bool
    {
        if (! $this->tenantUsable($organization)) {
            return false;
        }
        $row = DB::table('organization_module_entitlements')->where('organization_id', $organization->id)->where('module', $module)->first();
        if (! $row) {
            return $this->defaultModuleEnabled($organization, $module);
        }
        if (! $row->enabled) {
            return false;
        }
        if ($row->starts_at && now()->lt($row->starts_at)) {
            return false;
        }
        if ($row->ends_at && now()->gte($row->ends_at)) {
            return false;
        }

        return true;
    }

    public function assertModule(Organization $organization, string $module): void
    {
        if (! $this->moduleEnabled($organization, $module)) {
            throw new AuthorizationException("The {$module} module is not enabled for this organization subscription.");
        }
    }

    public function setModules(int $organizationId, array $modules, string $source = 'onboarding'): void
    {
        $allowed = array_keys((array) config('security.subscription.modules', []));
        foreach ($allowed as $module) {
            DB::table('organization_module_entitlements')->updateOrInsert(
                ['organization_id' => $organizationId, 'module' => $module],
                ['enabled' => in_array($module, $modules, true), 'source' => $source, 'updated_at' => now(), 'created_at' => now()],
            );
        }
    }

    private function defaultModuleEnabled(Organization $organization, string $module): bool
    {
        $plans = (array) config('security.subscription.plan_modules', []);
        $modules = (array) ($plans[$organization->plan] ?? $plans['default'] ?? []);

        return in_array($module, $modules, true);
    }
}
