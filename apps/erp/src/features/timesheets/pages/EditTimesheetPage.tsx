import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@workforce-erp/ui/components/button";
import { Card, CardContent } from "@workforce-erp/ui/components/card";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import { Separator } from "@workforce-erp/ui/components/separator";
import { companyRoutes } from "#routes/paths";
import { timesheetDetailQueryOptions } from "../api/timesheets.queries";
import { useUpdateTimesheet } from "../api/timesheets.mutations";
import { TimesheetForm, type TimesheetFormValues } from "../components/TimesheetForm";

function toApiDateTime(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "problem" in error) {
    const problem = (error as { problem?: { detail?: string; title?: string } }).problem;
    return problem?.detail ?? problem?.title ?? "The timesheet could not be updated.";
  }
  return error instanceof Error ? error.message : "The timesheet could not be updated.";
}

export default function EditTimesheetPage() {
  const navigate = useNavigate();
  const { tenantKey = "", companyKey = "", timesheetId = "" } = useParams();
  const detailPath = companyRoutes.timesheetDetails(tenantKey, companyKey, timesheetId);
  const detailQuery = useQuery(timesheetDetailQueryOptions(timesheetId));
  const updateTimesheet = useUpdateTimesheet();

  async function save(values: TimesheetFormValues) {
    try {
      await updateTimesheet.mutateAsync({
        id: timesheetId,
        payload: {
          employee_id: values.employee_id,
          date: values.date,
          clock_in: toApiDateTime(values.clock_in),
          clock_out: toApiDateTime(values.clock_out),
          status: values.status,
        },
      });
      toast.success("Timesheet updated successfully");
      navigate(detailPath, { replace: true });
    } catch (error) {
      toast.error("Unable to update timesheet", { description: errorMessage(error) });
    }
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            People · Timesheets
          </p>
          <h2 className="mt-1 font-heading text-xl font-semibold sm:text-2xl">Edit Timesheet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Update the selected work-log entry.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(detailPath)}>
          <ArrowLeft className="mr-2 size-4" /> Back to details
        </Button>
      </header>
      <Separator />

      {detailQuery.isPending ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-44 w-full" />
          </CardContent>
        </Card>
      ) : detailQuery.isError || !detailQuery.data?.data ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertCircle className="size-8 text-destructive" />
            <p className="font-medium">Unable to load this timesheet</p>
            <Button variant="outline" onClick={() => void detailQuery.refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TimesheetForm
          initialValue={detailQuery.data.data}
          submitLabel="Save changes"
          pending={updateTimesheet.isPending}
          onCancel={() => navigate(detailPath)}
          onSubmit={save}
        />
      )}
    </div>
  );
}
