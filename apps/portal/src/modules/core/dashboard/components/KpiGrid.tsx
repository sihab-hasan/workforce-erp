import {
  Users,
  CalendarOff,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@workforce-erp/ui/components/card"
import { Badge } from "@workforce-erp/ui/components/badge"
import { cn } from "@workforce-erp/ui/lib/utils"

type Trend = "up" | "down" | "neutral"

interface KpiCardDatum {
  label: string
  value: string
  change: string
  trend: Trend
  icon: React.ElementType
  caption: string
}

const kpiData: KpiCardDatum[] = [
  {
    label: "Total Employees",
    value: "248",
    change: "+12 hired this month",
    trend: "up",
    icon: Users,
    caption: "Active employee base",
  },
  {
    label: "Pending Leave Requests",
    value: "17",
    change: "−5 since last week",
    trend: "down",
    icon: CalendarOff,
    caption: "Awaiting manager action",
  },
  {
    label: "Active Payroll",
    value: "$182,400",
    change: "Current monthly cycle",
    trend: "neutral",
    icon: DollarSign,
    caption: "Gross payroll estimate",
  },
]

const trendIconMap: Record<Trend, React.ElementType> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
}

const trendVariantMap: Record<Trend, "default" | "destructive" | "secondary"> =
  {
    up: "default",
    down: "destructive",
    neutral: "secondary",
  }

const cardToneMap: Record<Trend, string> = {
  up: "border-primary/20 bg-primary/5",
  down: "border-destructive/20 bg-destructive/5",
  neutral: "bg-card",
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
          const trendVariant = trendVariantMap[kpi.trend]

          return (
            <Card
              key={kpi.label}
              size="sm"
              className={cn("rounded-lg shadow-sm", cardToneMap[kpi.trend])}
            >
              <CardHeader>
                <CardTitle>{kpi.label}</CardTitle>
                <CardDescription>{kpi.caption}</CardDescription>
                <CardAction>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-border">
                    <Icon aria-hidden />
                  </div>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-3xl font-semibold text-foreground tabular-nums">
                  {kpi.value}
                </p>
                <Badge variant={trendVariant} className="mt-3">
                  <TrendIcon data-icon="inline-start" aria-hidden />
                  {kpi.change}
                </Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
