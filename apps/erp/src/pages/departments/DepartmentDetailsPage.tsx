import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { toast } from "sonner";
import { apiDelete, apiGet, errorMessage, formatDateTime } from "#features/erp-core/api";
import type { DepartmentRecord } from "#features/erp-core/types";
import {
  ErpPage,
  ErrorState,
  LoadingState,
  SectionCard,
  StatCard,
  StatusPill,
} from "#components/erp/ErpPage";
import { companyRoutes } from "#routes/paths";
export default function DepartmentDetailsPage() {
  const { tenantKey = "", companyKey = "", departmentId = "" } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["department", tenantKey, companyKey, departmentId],
    queryFn: () => apiGet<DepartmentRecord>(`/api/v1/departments/${departmentId}`),
  });
  const remove = useMutation({
    mutationFn: () => apiDelete(`/api/v1/departments/${departmentId}`),
    onSuccess: () => {
      toast.success("Department deleted");
      void qc.invalidateQueries({ queryKey: ["departments", tenantKey, companyKey] });
      nav(companyRoutes.departments(tenantKey, companyKey));
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  if (q.isLoading) return <LoadingState />;
  if (q.isError || !q.data)
    return <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />;
  const d = q.data;
  return (
    <ErpPage
      title={d.name}
      description="Department profile, manager assignment and employee coverage."
      actions={
        <>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to={companyRoutes.departmentEdit(tenantKey, companyKey, d.id)} />}
          >
            <Pencil />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("Delete this department?")) remove.mutate();
            }}
          >
            <Trash2 />
            Delete
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Employees" value={d.employees_count} />
        <StatCard
          label="Manager"
          value={<span className="text-base">{d.manager?.name || "Unassigned"}</span>}
        />
        <StatCard
          label="Status"
          value={<StatusPill value={d.is_active ? "active" : "inactive"} />}
        />
      </div>
      <SectionCard title="Department information">
        <dl className="grid gap-5 sm:grid-cols-2">
          <Info label="Code" value={d.code} />
          <Info label="Company" value={d.branch?.name} />
          <Info label="Manager employee ID" value={d.manager?.employee_id} />
          <Info label="Last updated" value={formatDateTime(d.updated_at)} />
        </dl>
      </SectionCard>
    </ErpPage>
  );
}
function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value || "—"}</dd>
    </div>
  );
}
