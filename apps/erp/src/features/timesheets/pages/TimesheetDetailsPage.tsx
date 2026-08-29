import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@workforce-erp/ui/components/button";
import {
  ErpPage,
  ErrorState,
  LoadingState,
  SectionCard,
  StatCard,
  StatusPill,
} from "#components/erp/ErpPage";
import { companyRoutes } from "#routes/paths";
import { timesheetDetailQueryOptions } from "../api/timesheets.queries";
import { useDeleteTimesheet } from "../api/timesheets.mutations";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(
        date,
      );
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
}

function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "problem" in error) {
    const problem = (error as { problem?: { detail?: string; title?: string } }).problem;
    return problem?.detail ?? problem?.title ?? "The action could not be completed.";
  }
  return error instanceof Error ? error.message : "The action could not be completed.";
}

export default function TimesheetDetailsPage() {
  const navigate = useNavigate();
  const { tenantKey = "", companyKey = "", timesheetId = "" } = useParams();
  const detailQuery = useQuery(timesheetDetailQueryOptions(timesheetId));
  const deleteTimesheet = useDeleteTimesheet();
  const timesheet = detailQuery.data?.data;
  const listPath = companyRoutes.timesheets(tenantKey, companyKey);

  async function remove() {
    if (!timesheet) return;
    if (!confirm("Are you sure you want to delete this timesheet?")) return;
    try {
      await deleteTimesheet.mutateAsync(timesheet.id);
      toast.success("Timesheet deleted");
      navigate(listPath, { replace: true });
    } catch (error) {
      toast.error("Unable to delete timesheet", { description: errorMessage(error) });
    }
  }

  if (detailQuery.isPending) {
    return (
      <ErpPage title="Timesheet details" description="Loading timesheet record…">
        <LoadingState label="Loading timesheet details…" />
      </ErpPage>
    );
  }

  if (detailQuery.isError || !timesheet) {
    return (
      <ErpPage title="Timesheet details" description="View work-log record">
        <ErrorState
          message="Unable to load this timesheet. It may have been removed or you may not have access."
          onRetry={() => void detailQuery.refetch()}
        />
      </ErpPage>
    );
  }

  return (
    <ErpPage
      title={timesheet.employee?.name ?? `Employee #${timesheet.employee_id}`}
      description={`Work log for ${formatDate(timesheet.date)} · Record #${timesheet.id}`}
      actions={
        <>
          <Button variant="outline" nativeButton={false} render={<Link to={listPath} />}>
            <ArrowLeft />
            Back
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to={companyRoutes.timesheetEdit(tenantKey, companyKey, timesheet.id)} />}
          >
            <Pencil />
            Edit
          </Button>
          <Button
            variant="destructive"
            disabled={deleteTimesheet.isPending}
            onClick={() => void remove()}
          >
            <Trash2 />
            {deleteTimesheet.isPending ? "Deleting…" : "Delete"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Work status" value={<StatusPill value={timesheet.status} />} />
        <StatCard
          label="Total hours"
          value={
            <span className="font-semibold text-2xl">
              {Number(timesheet.total_hours || 0).toFixed(2)} h
            </span>
          }
        />
        <StatCard
          label="Work date"
          value={<span className="text-base">{formatDate(timesheet.date)}</span>}
        />
        <StatCard
          label="Employee"
          value={
            <span className="text-base font-semibold">
              {timesheet.employee?.name ?? `#${timesheet.employee_id}`}
            </span>
          }
        />
      </div>

      <SectionCard title="Attendance timestamps" description="Punch-in and punch-out events">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Clock In</dt>
            <dd className="mt-2 text-sm font-semibold text-foreground">
              {formatDateTime(timesheet.clock_in)}
            </dd>
          </div>
          <div className="rounded-xl border p-4">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Clock Out</dt>
            <dd className="mt-2 text-sm font-semibold text-foreground">
              {formatDateTime(timesheet.clock_out)}
            </dd>
          </div>
        </dl>
      </SectionCard>
    </ErpPage>
  );
}
