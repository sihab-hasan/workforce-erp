import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workforce-erp/ui/components/card"
import { Badge } from "@workforce-erp/ui/components/badge"

const departments = [
  { name: "Engineering",  count: 52, color: "bg-primary",      dot: "bg-primary" },
  { name: "Operations",   count: 44, color: "bg-violet-500",   dot: "bg-violet-500" },
  { name: "Sales",        count: 38, color: "bg-emerald-500",  dot: "bg-emerald-500" },
  { name: "HR & Admin",   count: 27, color: "bg-amber-400",    dot: "bg-amber-400" },
  { name: "Finance",      count: 21, color: "bg-rose-500",     dot: "bg-rose-500" },
  { name: "Marketing",    count: 18, color: "bg-cyan-500",     dot: "bg-cyan-500" },
  { name: "Others",       count: 48, color: "bg-muted-foreground", dot: "bg-muted-foreground" },
]

const total = departments.reduce((sum, d) => sum + d.count, 0)

export interface EmployeeStatisticsProps {
  className?: string
}

export function EmployeeStatistics({ className }: EmployeeStatisticsProps) {
  return (
    <section className={className}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Employees by Department</CardTitle>
          <CardDescription>
            {total} total across {departments.length} departments
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          {/* stacked bar */}
          <div className="flex h-2 overflow-hidden mx-6 rounded-full mb-2">
            {departments.map((dept) => (
              <div
                key={dept.name}
                className={`${dept.color} transition-all duration-700`}
                style={{ width: `${(dept.count / total) * 100}%` }}
              />
            ))}
          </div>

          <ul className="divide-y divide-border">
            {departments.map((dept) => {
              const pct = Math.round((dept.count / total) * 100)
              return (
                <li
                  key={dept.name}
                  className="flex items-center gap-3 px-6 py-2.5"
                >
                  <span className={`size-2 shrink-0 rounded-full ${dept.dot}`} />
                  <span className="flex-1 text-sm text-foreground">
                    {dept.name}
                  </span>
                  <Badge variant="secondary" className="text-[10px] tabular-nums">
                    {pct}%
                  </Badge>
                  <span className="w-8 text-right text-sm font-semibold text-foreground tabular-nums">
                    {dept.count}
                  </span>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </section>
  )
}
