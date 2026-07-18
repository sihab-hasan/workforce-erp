import { Separator } from "@workforce-erp/ui/components/separator"
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
    <div className="space-y-6 pb-20 md:pb-0">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {formattedDate}
          </p>
          {/*
           * h2 is used here because h1 lives in PortalHeader for the page title.
           * This is a section-level heading within the main content area.
           */}
          <h2 className="font-heading mt-1 text-xl font-semibold text-foreground sm:text-2xl">
            {greetingText}, Team
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening across your organisation today.
          </p>
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          Placeholder data · Updated {updatedAt}
        </p>
      </header>

      <Separator />

      {/* ── KPI summary cards ─────────────────────────────────────────────── */}
      <KpiGrid />

      {/* ── Attendance + Headcount ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AttendanceSummary />
        <EmployeeStatistics />
      </div>

      {/* ── Activity feed + Quick actions ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ActivityFeed className="lg:col-span-2" />
        <QuickActions />
      </div>

    </div>
  )
}
