import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Clock3,
  Edit3,
  Trash2,
  UserRound,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Button } from "@workforce-erp/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import { Separator } from "@workforce-erp/ui/components/separator";
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

function titleCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "problem" in error) {
    const problem = (error as { problem?: { detail?: string; title?: string } }).problem;
    return problem?.detail ?? problem?.title ?? "The timesheet could not be deleted.";
  }
  return error instanceof Error ? error.message : "The timesheet could not be deleted.";
}

export default function TimesheetDetailsPage() {
  const navigate = useNavigate();
  const { tenantKey = "", companyKey = "", timesheetId = "" } = useParams();
  const detailQuery = useQuery(timesheetDetailQueryOptions(timesheetId));
  const deleteTimesheet = useDeleteTimesheet();
  const listPath = companyRoutes.timesheets(tenantKey, companyKey);

  async function remove() {
    if (!window.confirm("Delete this timesheet? This action cannot be undone.")) return;
    try {
      await deleteTimesheet.mutateAsync(timesheetId);
      toast.success("Timesheet deleted");
      navigate(listPath, { replace: true });
    } catch (error) {
      toast.error("Unable to delete timesheet", { description: errorMessage(error) });
    }
  }

  const timesheet = detailQuery.data?.data;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            People · Timesheets
          </p>
          <h2 className="mt-1 font-heading text-xl font-semibold sm:text-2xl">Timesheet Details</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review work-log timestamps, hours, employee, and status.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(listPath)}>
            <ArrowLeft className="mr-2 size-4" /> Back
          </Button>
          {timesheet && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(companyRoutes.timesheetEdit(tenantKey, companyKey, timesheet.id))
              }
            >
              <Edit3 className="mr-2 size-4" /> Edit
            </Button>
          )}
          {timesheet && (
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteTimesheet.isPending}
              onClick={() => void remove()}
            >
              <Trash2 className="mr-2 size-4" />{" "}
              {deleteTimesheet.isPending ? "Deleting…" : "Delete"}
            </Button>
          )}
        </div>
      </header>
      <Separator />

      {detailQuery.isPending ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      ) : detailQuery.isError || !timesheet ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertCircle className="size-8 text-destructive" />
            <p className="font-medium">Unable to load this timesheet</p>
            <p className="text-sm text-muted-foreground">
              It may have been removed or you may not have access.
            </p>
            <Button variant="outline" onClick={() => void detailQuery.refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>
                {timesheet.employee?.name ?? `Employee #${timesheet.employee_id}`}
              </CardTitle>
              <CardDescription>Timesheet #{timesheet.id}</CardDescription>
            </div>
            <Badge variant="secondary">{titleCase(timesheet.status)}</Badge>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <UserRound className="size-4" /> Employee
              </div>
              <p className="font-medium">
                {timesheet.employee?.name ?? `#${timesheet.employee_id}`}
              </p>
            </div>
            <div className="rounded-xl border p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <CalendarDays className="size-4" /> Work date
              </div>
              <p className="font-medium">{formatDate(timesheet.date)}</p>
            </div>
            <div className="rounded-xl border p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Clock3 className="size-4" /> Total hours
              </div>
              <p className="font-medium">{Number(timesheet.total_hours || 0).toFixed(2)} h</p>
            </div>
            <div className="rounded-xl border p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Clock3 className="size-4" /> Status
              </div>
              <p className="font-medium">{titleCase(timesheet.status)}</p>
            </div>
            <div className="rounded-xl border p-4 sm:col-span-1 xl:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Clock in
              </p>
              <p className="mt-2 font-medium">{formatDateTime(timesheet.clock_in)}</p>
            </div>
            <div className="rounded-xl border p-4 sm:col-span-1 xl:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Clock out
              </p>
              <p className="mt-2 font-medium">{formatDateTime(timesheet.clock_out)}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
