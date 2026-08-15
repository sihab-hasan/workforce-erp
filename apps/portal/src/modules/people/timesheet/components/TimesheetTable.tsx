import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workforce-erp/ui/components/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card"
import { Badge } from "@workforce-erp/ui/components/badge"
import { Skeleton } from "@workforce-erp/ui/components/skeleton"
import { Button } from "@workforce-erp/ui/components/button"
import { Calendar, Clock, AlertCircle, Inbox, User } from "lucide-react"
import type { Timesheet, TimesheetStatus } from "../types/timesheets.types"

export interface TimesheetTableProps {
  timesheets: Timesheet[]
  isPending: boolean
  isError: boolean
  onRetry?: () => void
  className?: string
}

const STATUS_BADGES: Record<
  TimesheetStatus,
  {
    label: string
    variant: "default" | "secondary" | "outline" | "destructive"
    className?: string
  }
> = {
  present: {
    label: "Present",
    variant: "default",
    className:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  approved: {
    label: "Approved",
    variant: "default",
    className:
      "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  pending: {
    label: "Pending",
    variant: "secondary",
    className:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  "half-day": {
    label: "Half Day",
    variant: "secondary",
    className:
      "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  },
  "on-leave": {
    label: "On Leave",
    variant: "outline",
    className: "text-muted-foreground border-dashed",
  },
  absent: {
    label: "Absent",
    variant: "destructive",
    className:
      "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
  },
}

function formatIsoTime(iso: string | null | undefined): string {
  if (!iso) return "--:--"
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d)
  } catch {
    return "--:--"
  }
}

function formatIsoDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d)
  } catch {
    return dateStr
  }
}

export function TimesheetTable({
  timesheets,
  isPending,
  isError,
  onRetry,
  className,
}: TimesheetTableProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Attendance & Work Logs
        </CardTitle>
        <CardDescription className="text-xs">
          Recent shifts, clock-in records, and accumulated work hours.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <AlertCircle className="size-8 text-destructive" aria-hidden />
            <p className="text-sm font-medium">
              Failed to load attendance logs
            </p>
            <p className="text-xs text-muted-foreground">
              An error occurred while communicating with the server.
            </p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-2"
              >
                Try Again
              </Button>
            )}
          </div>
        ) : isPending ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : timesheets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
            <Inbox className="size-8 stroke-[1.5]" aria-hidden />
            <p className="text-sm font-medium text-foreground">
              No timesheet records found
            </p>
            <p className="text-xs">
              Clock in above or adjust filters to view historical logs.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Date</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead className="pr-6 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timesheets.map((entry) => {
                const badgeConfig = STATUS_BADGES[entry.status] ?? {
                  label: entry.status,
                  variant: "secondary" as const,
                }

                return (
                  <TableRow key={entry.id}>
                    <TableCell className="pl-6 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar
                          className="size-3.5 text-muted-foreground"
                          aria-hidden
                        />
                        <span>{formatIsoDate(entry.date)}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User
                          className="size-3.5 text-muted-foreground"
                          aria-hidden
                        />
                        <span className="truncate text-sm">
                          {entry.employee?.name ?? "Current User"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <Clock
                          className="size-3 text-muted-foreground"
                          aria-hidden
                        />
                        <span>{formatIsoTime(entry.clock_in)}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <Clock
                          className="size-3 text-muted-foreground"
                          aria-hidden
                        />
                        <span>{formatIsoTime(entry.clock_out)}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-semibold">
                        {Number(entry.total_hours).toFixed(2)} hrs
                      </span>
                    </TableCell>

                    <TableCell className="pr-6 text-right">
                      <Badge
                        variant={badgeConfig.variant}
                        className={`text-xs ${badgeConfig.className ?? ""}`}
                      >
                        {badgeConfig.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
