import { Users, Clock, CalendarOff, DollarSign, TrendingUp, TrendingDown } from "lucide-react"

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
    iconBg: "bg-indigo-100 dark:bg-indigo-950",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    label: "Attendance Rate",
    value: "94.2%",
    change: "+1.8% vs last week",
    trend: "up",
    icon: Clock,
    iconBg: "bg-emerald-100 dark:bg-emerald-950",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Pending Leaves",
    value: "17",
    change: "−5 from last week",
    trend: "down",
    icon: CalendarOff,
    iconBg: "bg-amber-100 dark:bg-amber-950",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    label: "Active Payroll",
    value: "$182,400",
    change: "Current month cycle",
    trend: "neutral",
    icon: DollarSign,
    iconBg: "bg-violet-100 dark:bg-violet-950",
    iconColor: "text-violet-600 dark:text-violet-400",
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
            <div
              key={kpi.label}
              className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div className={`flex size-10 items-center justify-center rounded-xl ${kpi.iconBg}`}>
                  <Icon className={`size-5 ${kpi.iconColor}`} />
                </div>
                {kpi.trend !== "neutral" && (
                  <span className={`flex items-center gap-1 text-xs font-semibold ${
                    kpi.trend === "up"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-500 dark:text-rose-400"
                  }`}>
                    {kpi.trend === "up"
                      ? <TrendingUp className="size-3.5" />
                      : <TrendingDown className="size-3.5" />}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {kpi.value}
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {kpi.label}
                </p>
              </div>
              <p className={`mt-3 text-xs font-medium ${
                kpi.trend === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : kpi.trend === "down"
                    ? "text-rose-500 dark:text-rose-400"
                    : "text-slate-400 dark:text-slate-500"
              }`}>
                {kpi.change}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

