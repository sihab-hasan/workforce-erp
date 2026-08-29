import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@workforce-erp/ui/components/button";
import { ErpPage } from "#components/erp/ErpPage";
import { companyRoutes } from "#routes/paths";
import { TimesheetForm, type TimesheetFormValues } from "../components/TimesheetForm";
import { useCreateTimesheet } from "../api/timesheets.mutations";

function toApiDateTime(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "problem" in error) {
    const problem = (error as { problem?: { detail?: string; title?: string } }).problem;
    return problem?.detail ?? problem?.title ?? "The timesheet could not be saved.";
  }
  return error instanceof Error ? error.message : "The timesheet could not be saved.";
}

export default function CreateTimesheetPage() {
  const navigate = useNavigate();
  const { tenantKey = "", companyKey = "" } = useParams();
  const createTimesheet = useCreateTimesheet();
  const listPath = companyRoutes.timesheets(tenantKey, companyKey);

  async function save(values: TimesheetFormValues) {
    try {
      const result = await createTimesheet.mutateAsync({
        employee_id: values.employee_id,
        date: values.date,
        clock_in: toApiDateTime(values.clock_in),
        clock_out: toApiDateTime(values.clock_out),
        status: values.status,
      });
      toast.success("Timesheet created successfully");
      navigate(companyRoutes.timesheetDetails(tenantKey, companyKey, result.data.id), {
        replace: true,
      });
    } catch (error) {
      toast.error("Unable to create timesheet", { description: errorMessage(error) });
    }
  }

  return (
    <ErpPage
      title="Create timesheet"
      description="Add a manual work-log entry using verified employee timestamps."
      actions={
        <Button variant="outline" nativeButton={false} render={<Link to={listPath} />}>
          <ArrowLeft />
          Back to timesheets
        </Button>
      }
    >
      <TimesheetForm
        submitLabel="Create timesheet"
        pending={createTimesheet.isPending}
        onCancel={() => navigate(listPath)}
        onSubmit={save}
      />
    </ErpPage>
  );
}
