import { Building2, Users, CheckCircle2, TrendingUp } from "lucide-react"
import {
  Card,
  CardContent,
} from "@workforce-erp/ui/components/card"
import { ActivityFeed } from "@/modules/core/dashboard/components/ActivityFeed.tsx"
import { AttendanceSummary } from "@/modules/core/dashboard/components/AttendanceSummary.tsx"
import { EmployeeStatistics } from "@/modules/core/dashboard/components/EmployeeStatistics.tsx"
import { KpiGrid } from "@/modules/core/dashboard/components/KpiGrid.tsx"
import { QuickActions } from "@/modules/core/dashboard/components/QuickActions.tsx"

// ─── Dynamic greeting based on current hour ───────────────────────────────────
function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours()
  if (hour < 12) return { text: "Good morning", emoji: "☀️" }
  if (hour < 17) return { text: "Good afternoon", emoji: "🌤️" }
  return { text: "Good evening", emoji: "🌙" }
}

// ─── Stub workforce-at-a-glance data ──────────────────────────────────────────
const glanceStats = [
  { label: "Departments",      value: "12",  icon: Building2    },
  { label: "Active Employees", value: "231", icon: Users        },
  { label: "On-time Today",    value: "96%", icon: CheckCircle2 },
  { label: "Open Positions",   value: "8",   icon: TrendingUp   },
]

export default function DashboardPage() {
  const greeting = getGreeting()

  const lastUpdated = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date())

  return (
    <div className="space-y-6 pb-20 md:pb-0">

      {/* ── Welcome Banner ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[oklch(0.15_0.04_145)] via-[oklch(0.12_0.02_145)] to-[oklch(0.10_0_0)] px-6 py-8 ring-1 ring-primary/20">
        {/* Decorative glows */}
        <div className="pointer-events-none absolute -top-12 -right-12 size-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 right-32 size-32 rounded-full bg-primary/8 blur-2xl" />
        <div className="pointer-events-none absolute top-6 left-1/2 size-24 -translate-x-1/2 rounded-full bg-primary/5 blur-2xl" />

        <div className="relative">
          <p className="text-xs font-bold tracking-[0.25em] text-primary uppercase">
            Workforce ERP · Portal
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {greeting.text}, Team {greeting.emoji}
          </h1>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Here's what's happening across your organisation today.
          </p>
          <p className="mt-1 text-xs text-muted-foreground/50">
            Placeholder data · Last updated {lastUpdated}
          </p>
        </div>

        {/* Glance Stats strip */}
        <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {glanceStats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 ring-1 ring-primary/20 backdrop-blur-sm"
              >
                <Icon className="size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-lg font-bold leading-none text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────────── */}
      <KpiGrid />

      {/* ── Middle row: Attendance + Employee Stats ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AttendanceSummary />
        <EmployeeStatistics />
      </div>

      {/* ── Bottom row: Activity Feed + Quick Actions ───────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ActivityFeed className="lg:col-span-2" />
        <QuickActions className="lg:col-span-1" />
      </div>

    </div>
  )
}
