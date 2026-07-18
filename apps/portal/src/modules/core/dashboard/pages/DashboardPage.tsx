import { Building2, Users, CheckCircle2, TrendingUp } from "lucide-react"
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
  { label: "Departments",     value: "12",  icon: Building2,    },
  { label: "Active Employees",value: "231", icon: Users,        },
  { label: "On-time Today",   value: "96%", icon: CheckCircle2, },
  { label: "Open Positions",  value: "8",   icon: TrendingUp,   },
]

export default function DashboardPage() {
  const greeting = getGreeting()

  // human-readable "last updated" timestamp
  const lastUpdated = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date())

  return (
    <div className="space-y-6">

      {/* ── Welcome Banner ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 py-8 text-white shadow-lg shadow-indigo-500/20">
        {/* decorative blobs */}
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-6 right-24 size-28 rounded-full bg-white/10 blur-2xl" />

        <div className="relative">
          <p className="text-xs font-bold tracking-[0.2em] text-indigo-200 uppercase">
            Workforce ERP · Portal
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            {greeting.text}, Team {greeting.emoji}
          </h1>
          <p className="mt-1 max-w-md text-sm text-indigo-200">
            Here's what's happening across your organisation today.
          </p>
          <p className="mt-1 text-xs text-indigo-300/60">
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
                className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm"
              >
                <Icon className="size-5 shrink-0 text-white/80" />
                <div>
                  <p className="text-lg font-bold leading-none">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-indigo-200">{stat.label}</p>
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

