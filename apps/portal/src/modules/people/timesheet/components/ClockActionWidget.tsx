import { useState, useEffect } from "react"
import {
  Clock,
  LogIn,
  LogOut,
  Timer,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card"
import { Button } from "@workforce-erp/ui/components/button"
import { Badge } from "@workforce-erp/ui/components/badge"
import { Skeleton } from "@workforce-erp/ui/components/skeleton"
import { useTodayTimesheet } from "../hooks/use-timesheets"
import { useClockIn, useClockOut } from "../api/timesheets.mutations"

export interface ClockActionWidgetProps {
  employeeId?: string
  className?: string
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

function formatIsoTime(isoString: string | null | undefined): string {
  if (!isoString) return "--:--"
  try {
    const d = new Date(isoString)
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d)
  } catch {
    return "--:--"
  }
}

function calculateDuration(clockInIso: string | null | undefined): string {
  if (!clockInIso) return "00h 00m 00s"
  try {
    const start = new Date(clockInIso).getTime()
    const now = Date.now()
    const diff = Math.max(0, now - start)

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    const pad = (n: number) => n.toString().padStart(2, "0")
    return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`
  } catch {
    return "00h 00m 00s"
  }
}

export function ClockActionWidget({
  employeeId,
  className,
}: ClockActionWidgetProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const {
    data: todayData,
    isPending: isTodayPending,
    isError: isTodayError,
    refetch: refetchToday,
  } = useTodayTimesheet(employeeId)

  const clockInMutation = useClockIn()
  const clockOutMutation = useClockOut()

  const status = todayData?.data
  const hasEmployeeProfile = status?.employee_profile_linked !== false
  const isClockedIn = Boolean(status?.is_clocked_in)
  const activeTimesheet = status?.active_timesheet
  const totalTodayHours =
    status?.total_today_hours ?? activeTimesheet?.total_hours ?? 0

  const isMutating = clockInMutation.isPending || clockOutMutation.isPending

  const handleClockIn = () => {
    clockInMutation.mutate(
      { employee_id: employeeId },
      {
        onSuccess: () => {
          toast.success("Clocked in successfully!", {
            description: `Shift started at ${formatTime(new Date())}`,
          })
          void refetchToday()
        },
        onError: (err: Error) => {
          const message = err.message || "Failed to clock in. Please try again."
          toast.error("Clock In Failed", { description: message })
        },
      }
    )
  }

  const handleClockOut = () => {
    clockOutMutation.mutate(
      { employee_id: employeeId },
      {
        onSuccess: () => {
          toast.success("Clocked out successfully!", {
            description: `Shift ended at ${formatTime(new Date())}`,
          })
          void refetchToday()
        },
        onError: (err: Error) => {
          const message =
            err.message || "Failed to clock out. Please try again."
          toast.error("Clock Out Failed", { description: message })
        },
      }
    )
  }

  return (
    <Card
      data-testid="clock-action-widget"
      className={`overflow-hidden border-border/80 bg-card/90 shadow-sm backdrop-blur-sm ${
        className ?? ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="size-5 text-primary" aria-hidden />
              <span>Time Clock & Work Status</span>
            </CardTitle>
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <Calendar className="size-3.5" aria-hidden />
              <span>{formatDate(currentTime)}</span>
            </CardDescription>
          </div>

          <div>
            {isTodayPending ? (
              <Skeleton className="h-6 w-24 rounded-full" />
            ) : isClockedIn ? (
              <Badge className="gap-1.5 border-emerald-500/30 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                </span>
                <span>Clocked In</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1.5 border-dashed text-muted-foreground"
              >
                <span className="size-2 rounded-full bg-muted-foreground/50" />
                <span>Clocked Out</span>
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Main display grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Current Local Time */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5">
            <p className="text-xs font-medium text-muted-foreground">
              Current Time
            </p>
            <p className="mt-1 font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {formatTime(currentTime)}
            </p>
          </div>

          {/* Clock In Timestamp */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5">
            <p className="text-xs font-medium text-muted-foreground">
              Clock In Time
            </p>
            {isTodayPending ? (
              <Skeleton className="mt-2 h-7 w-20 rounded" />
            ) : (
              <p className="mt-1 font-mono text-lg font-semibold text-foreground sm:text-xl">
                {activeTimesheet?.clock_in
                  ? formatIsoTime(activeTimesheet.clock_in)
                  : "--:--"}
              </p>
            )}
          </div>

          {/* Active Shift Elapsed Timer */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5">
            <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Timer className="size-3.5" aria-hidden />
              <span>Current Session</span>
            </p>
            {isTodayPending ? (
              <Skeleton className="mt-2 h-7 w-28 rounded" />
            ) : (
              <p
                className={`mt-1 font-mono text-lg font-semibold sm:text-xl ${
                  isClockedIn
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                }`}
              >
                {isClockedIn
                  ? calculateDuration(activeTimesheet?.clock_in)
                  : "00h 00m 00s"}
              </p>
            )}
          </div>

          {/* Total Accumulated Hours Today */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5">
            <p className="text-xs font-medium text-muted-foreground">
              Total Today
            </p>
            {isTodayPending ? (
              <Skeleton className="mt-2 h-7 w-16 rounded" />
            ) : (
              <p className="mt-1 text-lg font-semibold text-foreground sm:text-xl">
                {Number(totalTodayHours).toFixed(2)}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  hrs
                </span>
              </p>
            )}
          </div>
        </div>

        {!isTodayPending && !isTodayError && !hasEmployeeProfile && (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            <span>
              Time clock is unavailable until this account is linked to an
              employee profile.
            </span>
          </div>
        )}

        {/* ── Error state alert if query failed ────────────────────────────── */}
        {isTodayError && (
          <div
            role="alert"
            className="flex items-center justify-between gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>Could not fetch today's timesheet status.</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetchToday()}
              className="h-7 text-xs"
            >
              Retry
            </Button>
          </div>
        )}

        {/* ── Action buttons ───────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Clock In Button */}
          <Button
            id="clock-in-btn"
            size="lg"
            onClick={handleClockIn}
            disabled={
              !hasEmployeeProfile ||
              isTodayError ||
              isClockedIn ||
              isMutating ||
              isTodayPending
            }
            className="flex-1 gap-2 bg-emerald-600 font-medium text-white hover:bg-emerald-700 disabled:opacity-50 sm:min-w-40 sm:flex-initial dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {clockInMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <LogIn className="size-4" aria-hidden />
            )}
            <span>
              {clockInMutation.isPending ? "Clocking In..." : "Clock In"}
            </span>
          </Button>

          {/* Clock Out Button */}
          <Button
            id="clock-out-btn"
            variant="destructive"
            size="lg"
            onClick={handleClockOut}
            disabled={
              !hasEmployeeProfile ||
              isTodayError ||
              !isClockedIn ||
              isMutating ||
              isTodayPending
            }
            className="flex-1 gap-2 font-medium disabled:opacity-50 sm:min-w-40 sm:flex-initial"
          >
            {clockOutMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <LogOut className="size-4" aria-hidden />
            )}
            <span>
              {clockOutMutation.isPending ? "Clocking Out..." : "Clock Out"}
            </span>
          </Button>

          {/* Quick status message */}
          <div className="hidden items-center gap-1.5 text-xs text-muted-foreground lg:ml-auto lg:flex">
            {isClockedIn ? (
              <>
                <CheckCircle2 className="size-4 text-emerald-500" aria-hidden />
                <span>
                  Active shift since {formatIsoTime(activeTimesheet?.clock_in)}
                </span>
              </>
            ) : (
              <span>Ready for shift start</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
