import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { ADMIN_PATHS, adminTenantDetailsPath } from "#routes/paths";
import { TenantForm } from "#features/tenants/components/TenantForm";
import { useCreateTenantMutation } from "#features/tenants/api/tenants.mutations";
import type {
  CreateTenantPayload,
  UpdateTenantPayload,
} from "#features/tenants/types/tenants.types";

export function TenantCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateTenantMutation();

  const handleCreate = async (data: CreateTenantPayload | UpdateTenantPayload) => {
    const res = await createMutation.mutateAsync(data as CreateTenantPayload);
    if (res?.data?.id) {
      navigate(adminTenantDetailsPath(res.data.id));
    } else {
      navigate(ADMIN_PATHS.tenants);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20 md:pb-8">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card/70 p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            render={<Link to={ADMIN_PATHS.tenants} />}
            className="size-9 rounded-lg"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Provision New Tenant
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Setup enterprise organization workspace, domain routing, and initial owner
              credentials.
            </p>
          </div>
        </div>
      </div>

      {/* ── Creation Form ────────────────────────────────────────────────────── */}
      <TenantForm onSubmit={handleCreate} loading={createMutation.isPending} />
    </div>
  );
}

export default TenantCreatePage;
