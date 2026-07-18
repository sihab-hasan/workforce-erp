import { Badge } from "@workforce-erp/ui/components/badge"
import { Button } from "@workforce-erp/ui/components/button"
import { Separator } from "@workforce-erp/ui/components/separator"
import { CalendarDays, Download, RefreshCw } from "lucide-react"
import { ActivityFeed } from "@/modules/core/dashboard/components/ActivityFeed.tsx"
import { AttendanceSummary } from "@/modules/core/dashboard/components/AttendanceSummary.tsx"
import { EmployeeStatistics } from "@/modules/core/dashboard/components/EmployeeStatistics.tsx"
import { KpiGrid } from "@/modules/core/dashboard/components/KpiGrid.tsx"
import { QuickActions } from "@/modules/core/dashboard/components/QuickActions.tsx"

type GreetingResult = { text: string }

function getGreeting(): GreetingResult {
  const h = new Date().getHours()
  if (h < 12) return { text: "Good morning" }
  if (h < 17) return { text: "Good afternoon" }
  return { text: "Good evening" }
}

export default function DashboardPage() {
  const { text: greetingText } = getGreeting()

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date())

  const updatedAt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date())

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-0">
      <header className="flex flex-col gap-4 rounded-lg border border-border bg-card/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between lg:p-5">
        <div className="min-w-0">
          <Badge variant="outline" className="gap-1.5">
            <CalendarDays data-icon="inline-start" />
            {formattedDate}
          </Badge>
          <h2 className="mt-3 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            {greetingText}, Team
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            A focused view of workforce health, attendance, and operational
            tasks for today.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Badge variant="secondary">Updated {updatedAt}</Badge>
          <Button variant="outline" size="sm">
            <RefreshCw data-icon="inline-start" />
            Refresh
          </Button>
          <Button size="sm">
            <Download data-icon="inline-start" />
            Export
          </Button>
        </div>
      </header>

      <Separator />

      <KpiGrid />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AttendanceSummary />
        <EmployeeStatistics />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ActivityFeed className="lg:col-span-2" />
        <QuickActions />
      </div>
    </div>
  )
}
