import { Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@workforce-erp/ui/components/button"
import { Separator } from "@workforce-erp/ui/components/separator"
import { ClockActionWidget } from "../components/ClockActionWidget"
import { TimesheetTable } from "../components/TimesheetTable"
import { useTimesheets } from "../hooks/use-timesheets"

/**
 * TimesheetListPage
 *
 * Primary dashboard view for employee timesheets, live clock-in/clock-out actions,
 * and attendance history logs.
 */
export default function TimesheetListPage() {
  const navigate = useNavigate()
  const { data, isPending, isError, refetch } = useTimesheets()
  const timesheets = data?.data ?? []

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            People · Timesheets
          </p>
          <h2 className="mt-1 font-heading text-xl font-semibold text-foreground sm:text-2xl">
            Timesheets & Attendance
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track daily work shifts, record clock-in/out timestamps, and review
            attendance logs with real-time overlap protection.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => navigate("/people/timesheets/create")}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="size-4" />
          <span>Log Manual Shift</span>
        </Button>
      </header>

      <Separator />

      {/* ── Interactive Clock-In / Clock-Out Widget ────────────────────────── */}
      <ClockActionWidget />

      {/* ── Timesheet History Table ────────────────────────────────────────── */}
      <TimesheetTable
        timesheets={timesheets}
        isPending={isPending}
        isError={isError}
        onRetry={() => void refetch()}
      />
    </div>
  )
}
