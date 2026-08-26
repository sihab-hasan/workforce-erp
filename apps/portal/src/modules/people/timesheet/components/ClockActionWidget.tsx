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
  Hourglass,
  Target,
  AlertTriangle,
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

function calculateLiveDuration(
  clockInIso: string | null | undefined,
  _now: Date
): string {
  if (!clockInIso) return "00h 00m 00s"
  try {
    const start = new Date(clockInIso).getTime()
    const nowMs = _now.getTime()
    const diff = Math.max(0, nowMs - start)

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
  const [conflictError, setConflictError] = useState<string | null>(null)

  // Live timer ticking every second
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
  const isClockedIn = Boolean(status?.is_clocked_in)
  const activeTimesheet = status?.active_timesheet

  // Real-time metrics
  const scheduledHours = Number(status?.scheduled_hours ?? 8.0)
  const totalTodayHours = Number(status?.total_today_hours ?? 0.0)
  const remainingHours = Number(
    status?.remaining_hours ?? Math.max(0, scheduledHours - totalTodayHours)
  )
  const progressPercent = Math.min(
    100,
    Math.round((totalTodayHours / scheduledHours) * 100)
  )

  const isMutating = clockInMutation.isPending || clockOutMutation.isPending

  const handleClockIn = () => {
    setConflictError(null)
    clockInMutation.mutate(
      { employee_id: employeeId },
      {
        onSuccess: () => {
          setConflictError(null)
          toast.success("Clocked in successfully!", {
            description: `Active work session started at ${formatTime(new Date())}`,
          })
          void refetchToday()
        },
        onError: (err: Error) => {
          const message =
            err.message ||
            "Failed to clock in. An active session or overlap conflict was detected."
          setConflictError(message)
          toast.error("Clock In Failed", { description: message })
        },
      }
    )
  }

  const handleClockOut = () => {
    setConflictError(null)
    clockOutMutation.mutate(
      { employee_id: employeeId },
      {
        onSuccess: () => {
          setConflictError(null)
          toast.success("Clocked out successfully!", {
            description: `Work session completed at ${formatTime(new Date())}`,
          })
          void refetchToday()
        },
        onError: (err: Error) => {
          const message =
            err.message || "Failed to clock out. Please try again."
          setConflictError(message)
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
              <span>Real-Time Time Tracking & Attendance</span>
            </CardTitle>
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <Calendar className="size-3.5" aria-hidden />
              <span>{formatDate(currentTime)}</span>
            </CardDescription>
          </div>

          <div>
            {isTodayPending ? (
              <Skeleton className="h-6 w-28 rounded-full" />
            ) : isClockedIn ? (
              <Badge className="gap-1.5 border-emerald-500/30 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="font-semibold">
                  Active Session in Progress
                </span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1.5 border-dashed text-muted-foreground"
              >
                <span className="size-2 rounded-full bg-muted-foreground/50" />
                <span>Clocked Out · Standby</span>
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Conflict Error Alert ────────────────────────────────────────────── */}
        {conflictError && (
          <div
            role="alert"
            className="flex animate-in items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive fade-in slide-in-from-top-1"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div className="flex-1 space-y-0.5">
              <p className="font-semibold">Overlap / Session Conflict</p>
              <p className="text-muted-foreground">{conflictError}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConflictError(null)}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* ── Main display grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Current Local Time */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 transition-all hover:bg-muted/40">
            <p className="text-xs font-medium text-muted-foreground">
              Current Time
            </p>
            <p className="mt-1 font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {formatTime(currentTime)}
            </p>
          </div>

          {/* Clock In Timestamp */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 transition-all hover:bg-muted/40">
            <p className="text-xs font-medium text-muted-foreground">
              Session Started At
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
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 transition-all hover:bg-muted/40">
            <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Timer className="size-3.5 text-primary" aria-hidden />
              <span>Live Elapsed Session</span>
            </p>
            {isTodayPending ? (
              <Skeleton className="mt-2 h-7 w-28 rounded" />
            ) : (
              <p
                className={`mt-1 font-mono text-lg font-bold sm:text-xl ${
                  isClockedIn
                    ? "animate-pulse text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                }`}
              >
                {isClockedIn
                  ? calculateLiveDuration(
                      activeTimesheet?.clock_in,
                      currentTime
                    )
                  : "00h 00m 00s"}
              </p>
            )}
          </div>

          {/* Remaining Scheduled Work Time */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 transition-all hover:bg-muted/40">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Hourglass className="size-3.5 text-amber-500" aria-hidden />
                <span>Remaining Scheduled</span>
              </p>
              <span className="font-mono text-[10px] text-muted-foreground">
                {progressPercent}%
              </span>
            </div>
            {isTodayPending ? (
              <Skeleton className="mt-2 h-7 w-24 rounded" />
            ) : (
              <div className="mt-1 flex items-baseline gap-1.5">
                <p className="text-lg font-bold text-foreground sm:text-xl">
                  {remainingHours.toFixed(2)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    hrs left
                  </span>
                </p>
                <span className="text-xs text-muted-foreground">
                  / {scheduledHours.toFixed(2)}h
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Daily Schedule Progress Bar ──────────────────────────────────── */}
        <div className="space-y-1.5 rounded-xl border border-border/50 bg-muted/20 p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Target className="size-3.5 text-primary" aria-hidden />
              <span>Today's Work Progress</span>
            </span>
            <span className="font-mono font-medium text-foreground">
              {totalTodayHours.toFixed(2)} hrs tracked of{" "}
              {scheduledHours.toFixed(2)} hrs target
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercent >= 100 ? "bg-emerald-500" : "bg-primary"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

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
            disabled={isClockedIn || isMutating || isTodayPending}
            className="flex-1 gap-2 bg-emerald-600 font-medium text-white hover:bg-emerald-700 disabled:opacity-50 sm:min-w-40 sm:flex-initial dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {clockInMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <LogIn className="size-4" aria-hidden />
            )}
            <span>
              {clockInMutation.isPending ? "Starting Session..." : "Clock In"}
            </span>
          </Button>

          {/* Clock Out Button */}
          <Button
            id="clock-out-btn"
            variant="destructive"
            size="lg"
            onClick={handleClockOut}
            disabled={!isClockedIn || isMutating || isTodayPending}
            className="flex-1 gap-2 font-medium disabled:opacity-50 sm:min-w-40 sm:flex-initial"
          >
            {clockOutMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <LogOut className="size-4" aria-hidden />
            )}
            <span>
              {clockOutMutation.isPending ? "Ending Session..." : "Clock Out"}
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
