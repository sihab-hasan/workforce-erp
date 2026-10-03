import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@workforce-erp/auth";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Button } from "@workforce-erp/ui/components/button";
import { AlertCircle, CalendarDays, RefreshCw, Sparkles } from "lucide-react";
import { EmployeeStatistics } from "#features/dashboard/components/EmployeeStatistics";
import { KpiGrid } from "#features/dashboard/components/KpiGrid";
import { QuickActions } from "#features/dashboard/components/QuickActions";
import { ClockActionWidget } from "#features/timesheets/components/ClockActionWidget";
import { useEmployeeSummary } from "#features/employees/hooks/use-employees";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const activeFetches = useIsFetching();
  const summaryQuery = useEmployeeSummary();
  const summary = summaryQuery.data?.data;
  const summaryProps = summary === undefined ? {} : { summary };
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
  const firstName = session?.user.name?.trim().split(/\s+/)[0] || "there";

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-6">
      {/* ── Top Header Banner with Ambient Glow ───────────────────────────── */}
      <header className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card/75 p-5 shadow-xs backdrop-blur-md dark:bg-card/45 sm:flex-row sm:items-center sm:justify-between lg:p-6">
        {/* Subtle Ambient Background Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 size-56 rounded-full bg-teal-500/10 blur-3xl" />

        <div className="relative min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 border-border/80 bg-background/60 px-2.5 py-1 text-xs font-medium"
            >
              <CalendarDays className="size-3.5 text-primary" />
              {formattedDate}
            </Badge>

            <Badge
              variant="outline"
              className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
            >
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Workspace Active
            </Badge>
          </div>

          <h2 className="mt-2.5 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {greeting()}, {firstName} 👋
          </h2>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground sm:text-sm">
            Real-time workforce attendance, shift velocity, and organizational indicators.
          </p>
        </div>

        <div className="relative flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            disabled={activeFetches > 0}
            onClick={() => void queryClient.invalidateQueries()}
            className="h-9 gap-2 rounded-xl border-border/80 bg-background/60 shadow-xs transition hover:bg-background hover:shadow-sm"
          >
            <RefreshCw
              className={`size-3.5 ${activeFetches > 0 ? "animate-spin text-primary" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </header>

      {summaryQuery.isError ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-medium text-destructive sm:text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">Workforce summary could not be loaded.</p>
            <button
              type="button"
              className="mt-1 underline underline-offset-4"
              onClick={() => void summaryQuery.refetch()}
            >
              Retry loading data
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Key Performance Indicators ───────────────────────────────────── */}
      <KpiGrid {...summaryProps} loading={summaryQuery.isPending} />

      {/* ── Status Matrix & Quick Actions ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <EmployeeStatistics
          className="xl:col-span-2"
          {...summaryProps}
          loading={summaryQuery.isPending}
        />
        <QuickActions />
      </div>

      {/* ── Time Clock & Shift Punch Terminal ─────────────────────────────── */}
      <ClockActionWidget />
    </div>
  );
}
