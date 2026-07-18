import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card"
import { Progress, ProgressLabel, ProgressValue } from "@workforce-erp/ui/components/progress"
import { Separator } from "@workforce-erp/ui/components/separator"

/*
 * Design note — Progress component limitation:
 * `packages/ui/src/components/progress.tsx` always renders an internal
 * <ProgressTrack><ProgressIndicator /></ProgressTrack> after its children.
 * Providing a custom ProgressTrack in children would create a double bar.
 * Therefore the overall attendance rate uses <Progress> with its default
 * primary-colored track, and the per-category breakdown uses plain <div>
 * elements to display distinct contextual styles without modifying packages/ui.
 */

const TOTAL = 248

const breakdown = [
  { label: "Present",  count: 198, widthCls: "w-[80%]" },
  { label: "Late",     count: 16,  widthCls: "w-[6%]" },
  { label: "Absent",   count: 22,  widthCls: "w-[9%]" },
  { label: "On Leave", count: 12,  widthCls: "w-[5%]" },
] as const

const OVERALL_RATE = 94.2

export interface AttendanceSummaryProps {
  className?: string
}

export function AttendanceSummary({ className }: AttendanceSummaryProps) {
  return (
    <section aria-label="Attendance summary" className={className}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
          <CardDescription>
            {TOTAL} employees tracked · placeholder data
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Overall rate — uses Progress from packages/ui */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Overall rate</p>
            <Progress value={OVERALL_RATE}>
              <ProgressLabel>Present or late</ProgressLabel>
              <ProgressValue />
            </Progress>
          </div>

          <Separator />

          {/* Per-category breakdown — raw divs; Progress can't support multi-color */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Breakdown</p>
            {breakdown.map((item) => {
              const pct = Math.round((item.count / TOTAL) * 100)
              return (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-foreground">{item.label}</span>
                    <span className="tabular-nums text-sm text-muted-foreground">
                      {item.count}
                      <span className="ml-1 text-xs">({pct}%)</span>
                    </span>
                  </div>
                  {/* Intentionally a plain div — Progress component limitation noted above */}
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
          <span className="text-xs text-muted-foreground">Overall presence rate</span>
          <span className="font-heading text-sm font-semibold text-primary">
            {OVERALL_RATE}%
          </span>
        </CardFooter>
      </Card>
    </section>
  )
}
