import { ArrowLeft, Loader2 } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@workforce-erp/ui/components/button"
import { Separator } from "@workforce-erp/ui/components/separator"
import { TimesheetForm } from "../components/TimesheetForm"
import { useTimesheetDetail } from "../hooks/use-timesheets"

export default function EditTimesheetPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data, isPending, isError } = useTimesheetDetail(id ?? "")

  const timesheet = data?.data

  return (
    <div className="max-w-4xl space-y-6 pb-20 md:pb-0">
      <header className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/people/timesheets")}
          className="gap-1.5 text-xs"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Timesheets</span>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Edit Timesheet Entry
          </h1>
          <p className="text-xs text-muted-foreground">
            Update work hours or session details. Overlap validation will ensure
            time intervals remain valid.
          </p>
        </div>
      </header>

      <Separator />

      {isPending ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : isError || !timesheet ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
          Failed to load timesheet entry. It may not exist or has been removed.
        </div>
      ) : (
        <TimesheetForm timesheet={timesheet} />
      )}
    </div>
  )
}
