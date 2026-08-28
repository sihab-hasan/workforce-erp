import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@workforce-erp/ui/components/button";
import { ErpPage, ErrorState, LoadingState } from "#components/erp/ErpPage";
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

  if (detailQuery.isPending) {
    return (
      <ErpPage title="Edit timesheet" description="Loading timesheet data…">
        <LoadingState label="Loading timesheet…" />
      </ErpPage>
    );
  }

  if (detailQuery.isError || !detailQuery.data?.data) {
    return (
      <ErpPage title="Edit timesheet" description="Update the selected work-log entry.">
        <ErrorState
          message="Unable to load this timesheet. It may have been removed or you may not have access."
          onRetry={() => void detailQuery.refetch()}
        />
      </ErpPage>
    );
  }

  return (
    <ErpPage
      title="Edit timesheet"
      description="Update the selected work-log entry timestamps and status."
      actions={
        <Button variant="outline" nativeButton={false} render={<Link to={detailPath} />}>
          <ArrowLeft />
          Back to details
        </Button>
      }
    >
      <TimesheetForm
        initialValue={detailQuery.data.data}
        submitLabel="Update timesheet"
        pending={updateTimesheet.isPending}
        onCancel={() => navigate(detailPath)}
        onSubmit={save}
      />
    </ErpPage>
  );
}
