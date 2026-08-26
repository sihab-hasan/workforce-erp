import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { toast } from "sonner";
import { apiDelete, apiGet, errorMessage, formatDate } from "#features/erp-core/api";
import type { EmployeeRecord } from "#features/erp-core/types";
import {
  ErpPage,
  ErrorState,
  LoadingState,
  SectionCard,
  StatCard,
  StatusPill,
} from "#components/erp/ErpPage";
import { companyRoutes } from "#routes/paths";
export default function EmployeeDetailsPage() {
  const { tenantKey = "", companyKey = "", employeeId = "" } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["employee", tenantKey, companyKey, employeeId],
    queryFn: () => apiGet<EmployeeRecord>(`/api/v1/employees/${employeeId}`),
  });
  const rm = useMutation({
    mutationFn: () => apiDelete(`/api/v1/employees/${employeeId}`),
    onSuccess: () => {
      toast.success("Employee removed or deactivated");
      void qc.invalidateQueries({ queryKey: ["employees"] });
      nav(companyRoutes.employees(tenantKey, companyKey));
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  if (q.isLoading) return <LoadingState />;
  if (q.isError || !q.data)
    return <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />;
  const e = q.data;
  return (
    <ErpPage
      title={e.name}
      description={`${e.employee_id} · ${e.title || "No designation"}`}
      actions={
        <>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to={companyRoutes.employeeEdit(tenantKey, companyKey, e.id)} />}
          >
            <Pencil />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (
                confirm(
                  "Remove this employee? Historical records will cause deactivation instead of deletion.",
                )
              )
                rm.mutate();
            }}
          >
            <Trash2 />
            Remove
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Status" value={<StatusPill value={e.status} />} />
        <StatCard
          label="Department"
          value={<span className="text-base">{e.department || "Unassigned"}</span>}
        />
        <StatCard
          label="Manager"
          value={<span className="text-base">{e.manager || "Unassigned"}</span>}
        />
        <StatCard
          label="Hire date"
          value={<span className="text-base">{formatDate(e.hire_date)}</span>}
        />
      </div>
      <SectionCard title="Employment">
        <InfoGrid
          items={[
            ["Employee ID", e.employee_id],
            ["Employment type", e.employment_type],
            ["Designation", e.title],
            ["Location", e.location],
            ["Termination date", formatDate(e.termination_date)],
          ]}
        />
      </SectionCard>
      <SectionCard title="Contact & personal">
        <InfoGrid
          items={[
            ["Email", e.email],
            ["Phone", e.phone],
            ["Date of birth", formatDate(e.date_of_birth)],
            ["Gender", e.gender],
            ["Address", e.address],
            ["Emergency contact", e.emergency_contact_name],
            ["Emergency phone", e.emergency_contact_phone],
          ]}
        />
      </SectionCard>
      {e.notes ? (
        <SectionCard title="Notes">
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{e.notes}</p>
        </SectionCard>
      ) : null}
    </ErpPage>
  );
}
function InfoGrid({ items }: { items: [string, string | undefined | null][] }) {
  return (
    <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([l, v]) => (
        <div key={l}>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">{l}</dt>
          <dd className="mt-1 text-sm">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
