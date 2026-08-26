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

type EmployeeReport = {
  total: number;
  by_status: Record<string, number>;
  by_employment_type: Record<string, number>;
  by_department: Array<{ label: string; total: number }>;
};

export function EmployeeReportPage() {
  const query = useQuery({
    queryKey: ["reports", "employees"],
    queryFn: () => apiGet<EmployeeReport>("/api/v1/reports/employees"),
  });
  if (query.isLoading)
    return (
      <ErpPage title="Employee report">
        <LoadingState />
      </ErpPage>
    );
  if (query.isError || !query.data)
    return (
      <ErpPage title="Employee report">
        <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />
      </ErpPage>
    );
  const data = query.data;
  const active = data.by_status.active ?? 0;
  return (
    <ErpPage
      title="Employee report"
      description="Headcount distribution for the active workforce scope."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total employees" value={data.total} />
        <StatCard label="Active" value={active} />
        <StatCard label="Inactive / other" value={Math.max(0, data.total - active)} />
        <StatCard label="Departments represented" value={data.by_department.length} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="By status">
          <DataTable
            columns={["Status", "Employees"]}
            rows={Object.entries(data.by_status).map(([status, total]) => [
              <StatusPill value={status} />,
              total,
            ])}
          />
        </SectionCard>
        <SectionCard title="By employment type">
          <DataTable
            columns={["Employment type", "Employees"]}
            rows={Object.entries(data.by_employment_type).map(([type, total]) => [
              <span className="capitalize">{type.replaceAll("-", " ")}</span>,
              total,
            ])}
          />
        </SectionCard>
      </div>
      <SectionCard title="By department">
        <DataTable
          columns={["Department", "Employees"]}
          rows={data.by_department.map((row) => [row.label, row.total])}
        />
      </SectionCard>
    </ErpPage>
  );
}
export default EmployeeReportPage;
