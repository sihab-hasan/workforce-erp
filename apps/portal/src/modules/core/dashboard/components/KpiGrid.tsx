import { Users, Clock, CalendarOff, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workforce-erp/ui/components/card"
import { Badge } from "@workforce-erp/ui/components/badge"

interface KpiCard {
  label: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  icon: React.ElementType
  iconBg: string
  iconColor: string
}

const kpiData: KpiCard[] = [
  {
    label: "Total Employees",
    value: "248",
    change: "+12 this month",
    trend: "up",
    icon: Users,
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
  },
  {
    label: "Attendance Rate",
    value: "94.2%",
    change: "+1.8% vs last week",
    trend: "up",
    icon: Clock,
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
  },
  {
    label: "Pending Leaves",
    value: "17",
    change: "−5 from last week",
    trend: "down",
    icon: CalendarOff,
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
  },
  {
    label: "Active Payroll",
    value: "$182,400",
    change: "Current month cycle",
    trend: "neutral",
    icon: DollarSign,
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
  },
]

export interface KpiGridProps {
  className?: string
}

export function KpiGrid({ className }: KpiGridProps) {
  return (
    <section className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.label} className="transition-shadow hover:shadow-lg hover:shadow-primary/5">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`flex size-10 items-center justify-center rounded-xl ${kpi.iconBg}`}>
                    <Icon className={`size-5 ${kpi.iconColor}`} />
                  </div>
                  {kpi.trend !== "neutral" && (
                    <Badge
                      variant="secondary"
                      className={`gap-1 ${
                        kpi.trend === "up"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-rose-500/15 text-rose-400"
                      }`}
                    >
                      {kpi.trend === "up"
                        ? <TrendingUp className="size-3" />
                        : <TrendingDown className="size-3" />}
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                  {kpi.value}
                </CardTitle>
                <CardDescription className="font-medium">
                  {kpi.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className={`text-xs font-medium ${
                  kpi.trend === "up"
                    ? "text-emerald-400"
                    : kpi.trend === "down"
                      ? "text-rose-400"
                      : "text-muted-foreground"
                }`}>
                  {kpi.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
