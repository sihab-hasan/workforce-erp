import { useState } from "react"
import { AlertCircle, Calendar, Clock, Loader2, Save } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workforce-erp/ui/components/card"
import { Button } from "@workforce-erp/ui/components/button"
import { Input } from "@workforce-erp/ui/components/input"
import { Label } from "@workforce-erp/ui/components/label"
import { Textarea } from "@workforce-erp/ui/components/textarea"
import {
  useCreateTimesheet,
  useUpdateTimesheet,
} from "../api/timesheets.mutations"
import type { Timesheet, TimesheetStatus } from "../types/timesheets.types"

export interface TimesheetFormProps {
  timesheet?: Timesheet
  className?: string
}

export function TimesheetForm({ timesheet, className }: TimesheetFormProps) {
  const navigate = useNavigate()
  const isEditing = Boolean(timesheet?.id)

  const employeeId = timesheet?.employee_id ?? "1"
  const [date, setDate] = useState(
    timesheet?.date ?? new Date().toISOString().split("T")[0]
  )
  const [clockIn, setClockIn] = useState(
    timesheet?.clock_in
      ? new Date(timesheet.clock_in).toISOString().slice(11, 16)
      : "09:00"
  )
  const [clockOut, setClockOut] = useState(
    timesheet?.clock_out
      ? new Date(timesheet.clock_out).toISOString().slice(11, 16)
      : "17:00"
  )
  const [status, setStatus] = useState<TimesheetStatus>(
    timesheet?.status ?? "present"
  )
  const [notes, setNotes] = useState(timesheet?.notes ?? "")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const createMutation = useCreateTimesheet()
  const updateMutation = useUpdateTimesheet()
  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const clockInDateTime = `${date} ${clockIn}:00`
    const clockOutDateTime = clockOut ? `${date} ${clockOut}:00` : null

    if (clockOut && clockOut <= clockIn) {
      setErrorMessage("Clock-out time must be after clock-in time.")
      return
    }

    const payload = {
      employee_id: employeeId,
      date,
      clock_in: clockInDateTime,
      clock_out: clockOutDateTime,
      status,
      notes,
    }

    if (isEditing && timesheet?.id) {
      updateMutation.mutate(
        { id: timesheet.id, payload },
        {
          onSuccess: () => {
            toast.success("Timesheet entry updated successfully!")
            navigate("/people/timesheets")
          },
          onError: (err: Error) => {
            const msg = err.message || "Failed to update timesheet entry."
            setErrorMessage(msg)
            toast.error("Update Failed", { description: msg })
          },
        }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Timesheet entry created successfully!")
          navigate("/people/timesheets")
        },
        onError: (err: Error) => {
          const msg =
            err.message ||
            "Failed to create timesheet entry. Check for overlapping shifts."
          setErrorMessage(msg)
          toast.error("Creation Failed", { description: msg })
        },
      })
    }
  }

  return (
    <Card className={`border-border/80 bg-card shadow-sm ${className ?? ""}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {isEditing ? "Edit Timesheet Record" : "Manual Timesheet Entry"}
        </CardTitle>
        <CardDescription className="text-xs">
          Record shift timings and duration. Overlapping intervals for the same
          employee are automatically rejected.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Validation Conflict</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs font-medium">
                Work Date
              </Label>
              <div className="relative">
                <Calendar className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs font-medium">
                Status
              </Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TimesheetStatus)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              >
                <option value="present">Present</option>
                <option value="half-day">Half Day</option>
                <option value="on-leave">On Leave</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="clock_in" className="text-xs font-medium">
                Clock In Time
              </Label>
              <div className="relative">
                <Clock className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                <Input
                  id="clock_in"
                  type="time"
                  value={clockIn}
                  onChange={(e) => setClockIn(e.target.value)}
                  required
                  className="pl-9 font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="clock_out" className="text-xs font-medium">
                Clock Out Time
              </Label>
              <div className="relative">
                <Clock className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                <Input
                  id="clock_out"
                  type="time"
                  value={clockOut}
                  onChange={(e) => setClockOut(e.target.value)}
                  className="pl-9 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-medium">
              Notes & Shift Summary
            </Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Add any notes about duties performed or shift remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate("/people/timesheets")}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="gap-2"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              <span>{isEditing ? "Update Timesheet" : "Save Timesheet"}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
