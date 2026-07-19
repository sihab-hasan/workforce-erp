import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@workforce-erp/ui/components/progress"
import { Badge } from "@workforce-erp/ui/components/badge"
import { Separator } from "@workforce-erp/ui/components/separator"

const TOTAL = 248

const breakdown = [
  { label: "Present", count: 198, widthCls: "w-[80%]" },
  { label: "Late", count: 16, widthCls: "w-[6%]" },
  { label: "Absent", count: 22, widthCls: "w-[9%]" },
  { label: "On Leave", count: 12, widthCls: "w-[5%]" },
] as const

const OVERALL_RATE = 94.2

export interface AttendanceSummaryProps {
  className?: string
}

export function AttendanceSummary({ className }: AttendanceSummaryProps) {
  return (
    <section aria-label="Attendance summary" className={className}>
      <Card className="h-full rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
          <CardDescription>
            {TOTAL} employees tracked across all branches
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className="w-fit">
              Overall rate
            </Badge>
            <Progress value={OVERALL_RATE}>
              <ProgressLabel>Present or late</ProgressLabel>
              <ProgressValue />
            </Progress>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-muted-foreground">
              Breakdown
            </p>
            {breakdown.map((item) => {
              const pct = Math.round((item.count / TOTAL) * 100)
              return (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-foreground">
                      {item.label}
                    </span>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {item.count}
                      <span className="ml-1 text-xs">({pct}%)</span>
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${item.label}: ${pct}%`}
                    className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className={`h-full rounded-full bg-foreground/30 transition-[width] duration-500 motion-reduce:transition-none ${item.widthCls}`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>

        <CardFooter className="justify-between border-t border-border">
          <span className="text-xs text-muted-foreground">
            Overall presence rate
          </span>
          <span className="font-heading text-sm font-semibold text-primary">
            {OVERALL_RATE}%
          </span>
        </CardFooter>
      </Card>
    </section>
  )
}
