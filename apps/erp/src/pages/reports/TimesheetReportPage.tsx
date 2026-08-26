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
import { apiGet, errorMessage, formatDate } from "#features/erp-core/api";

type Summary = {
  records: number;
  hours: number;
  by_status: Array<{ status: string; total: number; hours: number }>;
  daily: Array<{ date: string; hours: number; records: number }>;
};
export function TimesheetReportPage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [filters, setFilters] = useState({ start_date: "", end_date: "" });
  const q = useQuery({
    queryKey: ["reports", "timesheets", filters],
    queryFn: () => apiGet<Summary>("/api/v1/reports/timesheets", filters),
  });
  return (
    <ErpPage
      title="Timesheet report"
      description="Recorded hours and workflow activity for the selected company."
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
            <StatCard label="Timesheet records" value={q.data.records} />
            <StatCard label="Recorded hours" value={Number(q.data.hours).toFixed(1)} />
          </div>
          <SectionCard title="By status">
            <DataTable
              columns={["Status", "Records", "Hours"]}
              rows={q.data.by_status.map((row) => [
                <StatusPill value={row.status} />,
                row.total,
                Number(row.hours ?? 0).toFixed(1),
              ])}
            />
          </SectionCard>
          <SectionCard title="Daily activity">
            <DataTable
              columns={["Date", "Records", "Hours"]}
              rows={q.data.daily.map((row) => [
                formatDate(row.date),
                row.records,
                Number(row.hours ?? 0).toFixed(1),
              ])}
            />
          </SectionCard>
        </>
      )}
    </ErpPage>
  );
}
export default TimesheetReportPage;
