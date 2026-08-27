import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { apiGet, errorMessage } from "#features/erp-core/api";
import type { OrganizationRecord } from "#features/erp-core/types";
import {
  ErpPage,
  ErrorState,
  LoadingState,
  SectionCard,
  StatCard,
  StatusPill,
} from "#components/erp/ErpPage";
import { tenantRoutes } from "#routes/paths";
export default function OrganizationProfilePage() {
  const { tenantKey = "" } = useParams();
  const q = useQuery({
    queryKey: ["organization", tenantKey],
    queryFn: () => apiGet<OrganizationRecord>("/api/v1/organizations/current"),
  });
  if (q.isLoading) return <LoadingState />;
  if (q.isError || !q.data)
    return <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />;
  const o = q.data;
  return (
    <ErpPage
      title={o.name}
      description="Organization profile, tenancy identity and high-level ERP footprint."
      actions={
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link to={tenantRoutes.organizationEdit(tenantKey)} />}
        >
          <Pencil />
          Edit organization
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Companies" value={o.stats?.companies ?? 0} />
        <StatCard label="Departments" value={o.stats?.departments ?? 0} />
        <StatCard label="Employees" value={o.stats?.employees ?? 0} />
        <StatCard label="Users" value={o.stats?.users ?? 0} />
      </div>
      <SectionCard title="Organization details">
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Legal name" value={o.legal_name} />
          <Info label="Slug" value={o.slug} />
          <Info label="Subdomain" value={o.subdomain} />
          <Info label="Email" value={o.email} />
          <Info label="Phone" value={o.phone} />
          <Info label="Timezone" value={o.timezone} />
          <Info label="Locale" value={o.locale} />
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Status</dt>
            <dd className="mt-1">
              <StatusPill value={o.status} />
            </dd>
          </div>
          <Info label="Your role" value={o.role} />
        </dl>
        {o.address ? (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Address</p>
            <p className="mt-1 text-sm">{o.address}</p>
          </div>
        ) : null}
      </SectionCard>
    </ErpPage>
  );
}
function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm capitalize">{value || "—"}</dd>
    </div>
  );
}
