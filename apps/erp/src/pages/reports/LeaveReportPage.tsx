import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
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

type Summary = {
  requests: number;
  days: number;
  by_status: Array<{ status: string; total: number; days: number }>;
  by_type: Array<{ label: string; total: number; days: number }>;
};
export function LeaveReportPage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [filters, setFilters] = useState({ start_date: "", end_date: "" });
  const q = useQuery({
    queryKey: ["reports", "leave", filters],
    queryFn: () => apiGet<Summary>("/api/v1/reports/leave", filters),
  });
  return (
    <ErpPage
      title="Leave report"
      description="Approved leave days and request distribution with optional date filtering."
      actions={
        <Button
          variant="outline"
          onClick={() => {
            setStart("");
            setEnd("");
            setFilters({ start_date: "", end_date: "" });
          }}
        >
          Reset
        </Button>
      }
    >
      <SectionCard title="Date range">
        <form
          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            setFilters({ start_date: start, end_date: end });
          }}
        >
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          <Button type="submit">Apply</Button>
        </form>
      </SectionCard>
      {q.isLoading ? (
        <LoadingState />
      ) : q.isError || !q.data ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Leave requests" value={q.data.requests} />
            <StatCard label="Approved leave days" value={Number(q.data.days).toFixed(1)} />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard title="By status">
              <DataTable
                columns={["Status", "Requests", "Days"]}
                rows={q.data.by_status.map((row) => [
                  <StatusPill value={row.status} />,
                  row.total,
                  Number(row.days ?? 0).toFixed(1),
                ])}
              />
            </SectionCard>
            <SectionCard title="By leave type">
              <DataTable
                columns={["Leave type", "Requests", "Days"]}
                rows={q.data.by_type.map((row) => [
                  row.label,
                  row.total,
                  Number(row.days ?? 0).toFixed(1),
                ])}
              />
            </SectionCard>
          </div>
        </>
      )}
    </ErpPage>
  );
}
export default LeaveReportPage;
