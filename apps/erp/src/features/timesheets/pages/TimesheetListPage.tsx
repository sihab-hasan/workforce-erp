import { Button } from "@workforce-erp/ui/components/button";
import { Separator } from "@workforce-erp/ui/components/separator";
import { ClockActionWidget } from "../components/ClockActionWidget";
import { TimesheetTable } from "../components/TimesheetTable";
import { useTimesheets } from "../hooks/use-timesheets";
import { useTimesheetsFilters } from "../hooks/use-timesheets-filters";

export default function TimesheetListPage() {
  const { page, pageSize, filters, setPage } = useTimesheetsFilters();
  const { data, isPending, isError, refetch } = useTimesheets(filters);
  const timesheets = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const lastPage = Math.max(1, data?.meta.lastPage ?? 1);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            People · Timesheets
          </p>
          <h2 className="mt-1 font-heading text-xl font-semibold text-foreground sm:text-2xl">
            Timesheets & Work Logs
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track daily work time, record clock-in/out timestamps, and review work logs.
          </p>
        </div>
      </header>

      <Separator />
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
    </div>
  );
}
