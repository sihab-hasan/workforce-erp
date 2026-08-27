import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@workforce-erp/ui/components/button";
import { Separator } from "@workforce-erp/ui/components/separator";
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
    <div className="space-y-6 pb-20 md:pb-0">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            People · Timesheets
          </p>
          <h2 className="mt-1 font-heading text-xl font-semibold sm:text-2xl">Create Timesheet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a manual work-log entry using the existing timesheet API.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(listPath)}>
          <ArrowLeft className="mr-2 size-4" /> Back to timesheets
        </Button>
      </header>
      <Separator />
      <TimesheetForm
        submitLabel="Create timesheet"
        pending={createTimesheet.isPending}
        onCancel={() => navigate(listPath)}
        onSubmit={save}
      />
    </div>
  );
}
