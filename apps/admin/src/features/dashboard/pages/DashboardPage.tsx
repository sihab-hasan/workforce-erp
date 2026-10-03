import { useState } from "react";
import { useAuth } from "@workforce-erp/auth";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Button } from "@workforce-erp/ui/components/button";
import { CalendarDays, RefreshCw, AlertCircle } from "lucide-react";

import { useDashboardAnalytics } from "../hooks/use-dashboard-analytics";
import { KpiGrid } from "../components/KpiGrid";
import { GrowthChart } from "../components/GrowthChart";
import { SubscriptionDistribution } from "../components/SubscriptionDistribution";
import { ModuleAdoptionMatrix } from "../components/ModuleAdoptionMatrix";
import { LiveAuditFeed } from "../components/LiveAuditFeed";
import { TopTenantsTable } from "../components/TopTenantsTable";
import { SystemHealthWidget } from "../components/SystemHealthWidget";
import { QuickActions } from "../components/QuickActions";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { session } = useAuth();
  const [timeRange, setTimeRange] = useState<string>("30d");

  const {
    data: analytics,
    isPending,
    isFetching,
    isError,
    refetch,
  } = useDashboardAnalytics(timeRange);

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const firstName = session?.user.name?.trim().split(/\s+/)[0] || "Administrator";

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-6">
      {/* ── Top Header Banner ────────────────────────────────────────────── */}
      <header className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5 shadow-xs backdrop-blur-md dark:bg-card/40 sm:flex-row sm:items-center sm:justify-between lg:p-6">
        {/* Subtle Ambient Background Glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 size-64 rounded-full bg-purple-500/5 blur-3xl" />

        <div className="relative min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 border-border/80 bg-background/50 px-2.5 py-1 text-xs"
            >
              <CalendarDays className="size-3.5 text-primary" />
              {formattedDate}
            </Badge>

            <Badge
              variant="outline"
              className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
            >
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Production Active
            </Badge>
          </div>

          <h2 className="mt-2.5 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {greeting()}, {firstName} 👋
          </h2>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground sm:text-sm">
            Platform-wide real-time operations, multi-tenant adoption, revenue velocity, and
            security health.
          </p>
        </div>

        {/* Time Range Filter & Refresh Controls */}
        <div className="relative flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center rounded-xl border border-border/80 bg-muted/40 p-1">
            {[
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "90d", label: "90 Days" },
              { id: "1y", label: "1 Year" },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setTimeRange(r.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  timeRange === r.id
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={isFetching}
            onClick={() => void refetch()}
            className="h-9 gap-1.5 rounded-xl border-border/80 bg-background/50 px-3 text-xs shadow-xs hover:bg-background"
          >
            <RefreshCw
              className={`size-3.5 ${isFetching ? "animate-spin text-primary" : "text-muted-foreground"}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </header>

      {/* ── Error Banner if any ────────────────────────────────────────── */}
      {isError ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Some analytics metrics could not be loaded.</p>
            <p className="mt-0.5 text-xs text-destructive/80">
              Please check your network connection or backend server status.
            </p>
            <button
              type="button"
              className="mt-2 text-xs font-medium underline underline-offset-4 hover:text-destructive"
              onClick={() => void refetch()}
            >
              Try reloading
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Executive KPI Metric Cards ─────────────────────────────────── */}
      <KpiGrid metrics={analytics?.metrics} loading={isPending} />

      {/* ── Primary Charts Row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GrowthChart data={analytics?.growthTimeseries} loading={isPending} />
        </div>
        <div className="lg:col-span-1">
          <SubscriptionDistribution plans={analytics?.plansBreakdown} loading={isPending} />
        </div>
      </div>

      {/* ── Secondary Analytics & Security Row ──────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ModuleAdoptionMatrix modules={analytics?.moduleAdoption} loading={isPending} />
        <LiveAuditFeed events={analytics?.recentAudit} loading={isPending} />
      </div>

      {/* ── Infrastructure Health & Top Tenants Row ─────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopTenantsTable organizations={analytics?.topOrganizations} loading={isPending} />
        <SystemHealthWidget health={analytics?.systemHealth} loading={isPending} />
      </div>

      {/* ── Platform Quick Actions ──────────────────────────────────────── */}
      <QuickActions />
    </div>
  );
}
