import { Users, UserCheck, UserMinus, Clock, TrendingUp } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@workforce-erp/ui/components/card"
import type { Employee } from "@/modules/people/employees/types/employees.types.ts"
import type { EmployeeDirectorySummary } from "@/modules/people/employees/types/employees-filters.types.ts"

interface SummaryDatum {
  label: string
  value: string | number
  sub: string
  icon: React.ElementType
}

function buildSummary(employees: Employee[]): SummaryDatum[] {
  const total = employees.length
  const active = employees.filter((e) => e.status === "active").length
  const onLeave = employees.filter((e) => e.status === "on-leave").length
  const probation = employees.filter((e) => e.status === "probation").length
  const newThisMonth = employees.filter((e) => {
    const hire = new Date(e.hireDate)
    const now = new Date()
    return (
      hire.getFullYear() === now.getFullYear() &&
      hire.getMonth() === now.getMonth()
    )
  }).length

  return [
    {
      label: "Total Employees",
      value: total,
      sub: "across all departments",
      icon: Users,
    },
    {
      label: "Active",
      value: active,
      sub: `${total ? Math.round((active / total) * 100) : 0}% of workforce`,
      icon: UserCheck,
    },
    {
      label: "On Leave",
      value: onLeave,
      sub: `${probation} on probation`,
      icon: UserMinus,
    },
    {
      label: "New This Month",
      value: newThisMonth,
      sub: "recent joiners",
      icon: TrendingUp,
    },
  ]
}

export interface EmployeeSummaryCardsProps {
  employees?: Employee[]
  summary?: EmployeeDirectorySummary
  className?: string
}

export function EmployeeSummaryCards({
  employees = [],
  summary: liveSummary,
  className,
}: EmployeeSummaryCardsProps) {
  const summary = liveSummary
    ? [
        {
          label: "Total Employees",
          value: liveSummary.total,
          sub: "across all departments",
          icon: Users,
        },
        {
          label: "Active",
          value: liveSummary.active,
          sub: `${liveSummary.total ? Math.round((liveSummary.active / liveSummary.total) * 100) : 0}% of workforce`,
          icon: UserCheck,
        },
        {
          label: "On Leave",
          value: liveSummary.on_leave,
          sub: `${liveSummary.probation} on probation`,
          icon: UserMinus,
        },
        {
          label: "New This Month",
          value: liveSummary.new_this_month,
          sub: "recent joiners",
          icon: TrendingUp,
        },
      ]
    : buildSummary(employees)

  return (
    <section aria-label="Employee summary statistics" className={className}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summary.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} size="sm">
              <CardHeader>
                <CardTitle>{item.label}</CardTitle>
                <CardAction>
                  <div className="rounded-xl bg-muted p-2">
                    <Icon
                      className="size-4 text-muted-foreground"
                      aria-hidden
                    />
                  </div>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-3xl font-semibold text-foreground tabular-nums">
                  {item.value}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3 shrink-0" aria-hidden />
                  <span>{item.sub}</span>
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
