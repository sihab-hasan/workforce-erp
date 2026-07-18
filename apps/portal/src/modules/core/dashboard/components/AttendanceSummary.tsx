import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workforce-erp/ui/components/card"
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@workforce-erp/ui/components/progress"

const breakdown = [
  {
    label: "Present",
    count: 198,
    total: 248,
    indicatorClass: "bg-emerald-500",
    labelClass: "text-emerald-400",
  },
  {
    label: "Late",
    count: 16,
    total: 248,
    indicatorClass: "bg-amber-400",
    labelClass: "text-amber-400",
  },
  {
    label: "Absent",
    count: 22,
    total: 248,
    indicatorClass: "bg-rose-500",
    labelClass: "text-rose-400",
  },
  {
    label: "On Leave",
    count: 12,
    total: 248,
    indicatorClass: "bg-violet-500",
    labelClass: "text-violet-400",
  },
]

export interface AttendanceSummaryProps {
  className?: string
}

export function AttendanceSummary({ className }: AttendanceSummaryProps) {
  return (
    <section className={className}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
          <CardDescription>Out of 248 total employees</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {breakdown.map((item) => {
            const pct = Math.round((item.count / item.total) * 100)
            return (
              /**
               * Progress wraps children AND auto-appends a ProgressTrack+ProgressIndicator
               * when no ProgressTrack is found among children. To avoid the double-bar,
               * we compose fully: supply our own ProgressTrack inside the Progress root
               * and suppress the default one by always providing children.
               */
              <Progress key={item.label} value={pct} className="gap-1.5">
                <ProgressLabel className={`text-xs font-medium ${item.labelClass}`}>
                  {item.label}
                </ProgressLabel>
                <ProgressValue className={`text-xs font-bold tabular-nums ${item.labelClass}`}>
                  {item.count}
                  <span className="ml-1 font-normal text-muted-foreground">
                    ({pct}%)
                  </span>
                </ProgressValue>
                {/* Full-width track below the label row */}
                <ProgressTrack className="h-2 w-full bg-muted/50">
                  <ProgressIndicator className={item.indicatorClass} />
                </ProgressTrack>
              </Progress>
            )
          })}
        </CardContent>

        {/* Summary footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <p className="text-xs text-muted-foreground">Overall presence rate</p>
          <p className="text-sm font-bold text-emerald-400">94.2%</p>
        </div>
      </Card>
    </section>
  )
}
