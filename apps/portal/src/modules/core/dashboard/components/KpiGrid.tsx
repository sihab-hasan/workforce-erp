import { Users, Clock, CalendarOff, DollarSign, TrendingUp, TrendingDown, Minus } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@workforce-erp/ui/components/card"

type Trend = "up" | "down" | "neutral"

interface KpiCardDatum {
  label: string
  value: string
  change: string
  trend: Trend
  icon: React.ElementType
}

const kpiData: KpiCardDatum[] = [
  {
    label: "Total Employees",
    value: "248",
    change: "+12 hired this month",
    trend: "up",
    icon: Users,
  },
  {
    label: "Attendance Rate",
    value: "94.2%",
    change: "+1.8 pp vs last week",
    trend: "up",
    icon: Clock,
  },
  {
    label: "Pending Leave Requests",
    value: "17",
    change: "−5 since last week",
    trend: "down",
    icon: CalendarOff,
  },
  {
    label: "Active Payroll",
    value: "$182,400",
    change: "Current monthly cycle",
    trend: "neutral",
    icon: DollarSign,
  },
]

const trendIconMap: Record<Trend, React.ElementType> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
}

const trendColorMap: Record<Trend, string> = {
  up: "text-primary",
  down: "text-destructive",
  neutral: "text-muted-foreground",
}

export interface KpiGridProps {
  className?: string
}

export function KpiGrid({ className }: KpiGridProps) {
  return (
    <section aria-label="Key performance indicators" className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon
          const TrendIcon = trendIconMap[kpi.trend]
          const trendColor = trendColorMap[kpi.trend]

          return (
            <Card key={kpi.label} size="sm">
              <CardHeader>
                <CardTitle>{kpi.label}</CardTitle>
                <CardAction>
                  <div className="rounded-xl bg-muted p-2">
                    <Icon className="size-4 text-muted-foreground" aria-hidden />
                  </div>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-3xl font-semibold tabular-nums text-foreground">
                  {kpi.value}
                </p>
                <p className={`mt-2 flex items-center gap-1 text-xs ${trendColor}`}>
                  <TrendIcon className="size-3 shrink-0" aria-hidden />
                  <span>{kpi.change}</span>
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
