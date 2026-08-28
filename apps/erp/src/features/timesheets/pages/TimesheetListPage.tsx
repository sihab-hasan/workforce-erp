import { Link, useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { ErpPage } from "#components/erp/ErpPage";
import { ClockActionWidget } from "../components/ClockActionWidget";
import { TimesheetTable } from "../components/TimesheetTable";
import { useTimesheets } from "../hooks/use-timesheets";
import { useTimesheetsFilters } from "../hooks/use-timesheets-filters";
import { companyRoutes } from "#routes/paths";

export default function TimesheetListPage() {
  const { tenantKey = "", companyKey = "" } = useParams();
  const { page, pageSize, filters, setPage } = useTimesheetsFilters();
  const { data, isPending, isError, refetch } = useTimesheets(filters);
  const timesheets = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const lastPage = Math.max(1, data?.meta.lastPage ?? 1);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <ErpPage
      title="Timesheets"
      description="Track daily work time, record clock-in/out timestamps, and review verified work logs."
      actions={
        <Button
          nativeButton={false}
          render={<Link to={companyRoutes.timesheetCreate(tenantKey, companyKey)} />}
        >
          <Plus />
          Log timesheet
        </Button>
      }
    >
      <ClockActionWidget />
      <TimesheetTable
        timesheets={timesheets}
        isPending={isPending}
        isError={isError}
        onRetry={() => void refetch()}
      />

      {!isPending && !isError && total > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted-foreground">
            Showing {from}–{to} of {total} records
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="min-w-20 text-center text-xs text-muted-foreground">
              Page {page} of {lastPage}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= lastPage}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </ErpPage>
  );
}
