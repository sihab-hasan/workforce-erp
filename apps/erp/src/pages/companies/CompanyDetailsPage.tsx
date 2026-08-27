import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { toast } from "sonner";
import { apiDelete, apiGet, errorMessage, formatDateTime } from "#features/erp-core/api";
import type { CompanyRecord } from "#features/erp-core/types";
import {
  ErpPage,
  ErrorState,
  LoadingState,
  SectionCard,
  StatCard,
  StatusPill,
} from "#components/erp/ErpPage";
import { tenantRoutes } from "#routes/paths";

export function CompanyDetailsPage() {
  const { tenantKey = "", companyId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["company", tenantKey, companyId],
    queryFn: () => apiGet<CompanyRecord>(`/api/v1/companies/${companyId}`),
  });
  const remove = useMutation({
    mutationFn: () => apiDelete(`/api/v1/companies/${companyId}`),
    onSuccess: () => {
      toast.success("Company deleted");
      void queryClient.invalidateQueries({ queryKey: ["companies", tenantKey] });
      navigate(tenantRoutes.companies(tenantKey));
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data)
    return <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />;
  const c = query.data;
  return (
    <ErpPage
      title={c.name}
      description="Company workspace profile and operational scope."
      actions={
        <>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to={tenantRoutes.companyEdit(tenantKey, c.id)} />}
          >
            <Pencil />
            Edit
          </Button>
          <Button
            variant="destructive"
            disabled={remove.isPending}
            onClick={() => {
              if (
                confirm(
                  "Delete this company? This is only allowed when it has no employees or departments.",
                )
              )
                remove.mutate();
            }}
          >
            <Trash2 />
            Delete
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Status"
          value={<StatusPill value={c.is_active ? "active" : "inactive"} />}
        />
        <StatCard label="Departments" value={c.departments_count} />
        <StatCard label="Employees" value={c.employees_count} />
      </div>
      <SectionCard title="Company information">
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Code" value={c.code} />
          <Info label="Email" value={c.email} />
          <Info label="Phone" value={c.phone} />
          <Info label="Timezone" value={c.timezone} />
          <Info label="Address" value={c.address} />
          <Info label="Last updated" value={formatDateTime(c.updated_at)} />
        </dl>
      </SectionCard>
    </ErpPage>
  );
}
function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value || "—"}</dd>
    </div>
  );
}
export default CompanyDetailsPage;
