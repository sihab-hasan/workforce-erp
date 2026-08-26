import { useQuery } from "@tanstack/react-query";
import {
  ErpPage,
  ErrorState,
  LoadingState,
  SectionCard,
  StatCard,
  DataTable,
  StatusPill,
} from "#components/erp/ErpPage";
import { apiGet, errorMessage } from "#features/erp-core/api";

type Row = {
  id: string;
  name: string;
  code?: string | null;
  company?: string | null;
  manager?: string | null;
  employees_count: number;
  is_active: boolean;
};
export function DepartmentReportPage() {
  const q = useQuery({
    queryKey: ["reports", "departments"],
    queryFn: () => apiGet<Row[]>("/api/v1/reports/departments"),
  });
  if (q.isLoading)
    return (
      <ErpPage title="Department report">
        <LoadingState />
      </ErpPage>
    );
  if (q.isError || !q.data)
    return (
      <ErpPage title="Department report">
        <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
      </ErpPage>
    );
  const totalEmployees = q.data.reduce((sum, row) => sum + Number(row.employees_count || 0), 0);
  return (
    <ErpPage
      title="Department report"
      description="Department staffing and ownership across the active company scope."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Departments" value={q.data.length} />
        <StatCard label="Active departments" value={q.data.filter((x) => x.is_active).length} />
        <StatCard label="Assigned employees" value={totalEmployees} />
      </div>
      <SectionCard title="Department workforce">
        <DataTable
          columns={["Department", "Code", "Company", "Manager", "Employees", "Status"]}
          rows={q.data.map((row) => [
            row.name,
            row.code ?? "—",
            row.company ?? "—",
            row.manager ?? "—",
            row.employees_count,
            <StatusPill value={row.is_active ? "active" : "inactive"} />,
          ])}
        />
      </SectionCard>
    </ErpPage>
  );
}
export default DepartmentReportPage;
