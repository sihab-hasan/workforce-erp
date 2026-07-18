import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card"
import { Separator } from "@workforce-erp/ui/components/separator"

const departments = [
  { name: "Engineering", count: 52 },
  { name: "Operations", count: 44 },
  { name: "Sales", count: 38 },
  { name: "HR & Admin", count: 27 },
  { name: "Finance", count: 21 },
  { name: "Marketing", count: 18 },
  { name: "Others", count: 48 },
] as const

const TOTAL = departments.reduce((sum, d) => sum + d.count, 0)

export interface EmployeeStatisticsProps {
  className?: string
}

export function EmployeeStatistics({ className }: EmployeeStatisticsProps) {
  return (
    <section aria-label="Employees by department" className={className}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Employees by Department</CardTitle>
          <CardDescription>
            {TOTAL} total across {departments.length} departments
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-1">
          {departments.map((dept, idx) => {
            const pct = Math.round((dept.count / TOTAL) * 100)
            return (
              <div key={dept.name}>
                {idx > 0 && <Separator className="my-1" />}
                <div className="flex items-center gap-3 py-1">
                  {/* Label */}
                  <span className="w-28 shrink-0 text-sm text-foreground">
                    {dept.name}
                  </span>

                  {/* Inline progress bar — same limitation as AttendanceSummary */}
                  <div className="flex-1">
                    <div
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${dept.name}: ${pct}%`}
                      className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Count + pct */}
                  <div className="w-16 text-right">
                    <span className="text-sm font-medium text-foreground tabular-nums">
                      {dept.count}
                    </span>
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {pct}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </section>
  )
}
