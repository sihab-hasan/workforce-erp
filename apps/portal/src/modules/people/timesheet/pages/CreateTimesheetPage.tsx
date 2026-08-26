import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@workforce-erp/ui/components/button"
import { Separator } from "@workforce-erp/ui/components/separator"
import { TimesheetForm } from "../components/TimesheetForm"

export default function CreateTimesheetPage() {
  const navigate = useNavigate()

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
            Log Manual Timesheet Entry
          </h1>
          <p className="text-xs text-muted-foreground">
            Record a historical or pre-approved work shift. Overlap detection
            will validate interval boundaries.
          </p>
        </div>
      </header>

      <Separator />

      <TimesheetForm />
    </div>
  )
}
