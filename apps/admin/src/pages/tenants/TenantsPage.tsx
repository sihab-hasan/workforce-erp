import { Link } from "react-router-dom";
import { PlusCircle, Building2, RefreshCw } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Separator } from "@workforce-erp/ui/components/separator";
import { ADMIN_PATHS } from "#routes/paths";

import { useTenants } from "#features/tenants/hooks/use-tenants";
import { useTenantsFilters } from "#features/tenants/hooks/use-tenants-filters";
import { TenantKpiCards } from "#features/tenants/components/TenantKpiCards";
import { TenantFilters } from "#features/tenants/components/TenantFilters";
import { TenantTable } from "#features/tenants/components/TenantTable";

export function TenantsPage() {
  const { filters, page, pageSize, queryFilters, isDirty, onFiltersChange, onReset, onPageChange } =
    useTenantsFilters(20);

  const { data, isPending, isFetching, isError, refetch } = useTenants(queryFilters);

  const tenants = data?.data ?? [];
  const totalCount = data?.meta?.total ?? tenants.length;

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-6">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card/70 p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Tenant Organizations
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Discover, inspect, provision, and manage multi-tenant enterprise workspaces across the
            platform.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isFetching}
            onClick={() => void refetch()}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            render={<Link to={ADMIN_PATHS.tenantCreate} />}
            className="h-9 gap-1.5 text-xs font-semibold shadow-xs"
          >
            <PlusCircle className="size-4" />
            <span>New Organization</span>
          </Button>
        </div>
      </header>

      {/* ── KPI Summary Cards ────────────────────────────────────────────────── */}
      <TenantKpiCards tenants={tenants} totalCount={totalCount} loading={isPending} />

      <Separator />

      {/* ── Filters & Search ─────────────────────────────────────────────────── */}
      <TenantFilters
        filters={filters}
        isDirty={isDirty}
        onFiltersChange={onFiltersChange}
        onReset={onReset}
      />

      {/* ── Tenants Data Table ───────────────────────────────────────────────── */}
      <TenantTable
        tenants={tenants}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        isPending={isPending}
        isError={isError}
        onPageChange={onPageChange}
        onRetry={() => void refetch()}
      />
    </div>
  );
}

export default TenantsPage;
