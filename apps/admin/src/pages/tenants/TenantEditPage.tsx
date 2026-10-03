import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Building2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import { ADMIN_PATHS, adminTenantDetailsPath } from "#routes/paths";
import { TenantForm } from "#features/tenants/components/TenantForm";
import { useTenant } from "#features/tenants/hooks/use-tenant";
import { useUpdateTenantMutation } from "#features/tenants/api/tenants.mutations";
import type {
  CreateTenantPayload,
  UpdateTenantPayload,
} from "#features/tenants/types/tenants.types";

export function TenantEditPage() {
  const { tenantId, organizationId } = useParams<{ tenantId?: string; organizationId?: string }>();
  const id = tenantId || organizationId || "";
  const navigate = useNavigate();

  const { data: res, isLoading, isError, refetch } = useTenant(id);
  const tenant = res?.data;
  const updateMutation = useUpdateTenantMutation();

  const handleUpdate = async (data: CreateTenantPayload | UpdateTenantPayload) => {
    if (!tenant?.id) return;
    await updateMutation.mutateAsync({
      id: tenant.id,
      payload: data as UpdateTenantPayload,
    });
    navigate(adminTenantDetailsPath(tenant.id));
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 pb-20 md:pb-8">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError || !tenant) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-xl border border-border/80 bg-card/60 p-8 text-center">
        <AlertTriangle className="mb-3 size-10 text-destructive" />
        <h2 className="text-lg font-bold text-foreground">Tenant Not Found</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          The requested tenant organization could not be loaded for editing.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Button variant="outline" size="sm" render={<Link to={ADMIN_PATHS.tenants} />}>
            <ArrowLeft className="mr-1.5 size-3.5" />
            Back to Directory
          </Button>
          <Button size="sm" onClick={() => void refetch()}>
            <RefreshCw className="mr-1.5 size-3.5" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20 md:pb-8">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card/70 p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            render={<Link to={adminTenantDetailsPath(tenant.id)} />}
            className="size-9 rounded-lg"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Edit {tenant.name}
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Update organization profile parameters, subscription plan, and regional settings.
            </p>
          </div>
        </div>
      </div>

      {/* ── Edit Form ────────────────────────────────────────────────────────── */}
      <TenantForm initialData={tenant} onSubmit={handleUpdate} loading={updateMutation.isPending} />
    </div>
  );
}

export default TenantEditPage;
