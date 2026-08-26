import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@workforce-erp/auth";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Button } from "@workforce-erp/ui/components/button";
import { Separator } from "@workforce-erp/ui/components/separator";
import { AlertCircle, CalendarDays, RefreshCw } from "lucide-react";
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
    <div className="flex flex-col gap-6 pb-20 md:pb-0">
      <header className="flex flex-col gap-4 rounded-lg border border-border bg-card/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between lg:p-5">
        <div className="min-w-0">
          <Badge variant="outline" className="gap-1.5">
            <CalendarDays data-icon="inline-start" />
            {formattedDate}
          </Badge>
          <h2 className="mt-3 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            {greeting()}, {firstName}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Live workforce and time-tracking information for your current workspace.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={activeFetches > 0}
          onClick={() => void queryClient.invalidateQueries()}
        >
          <RefreshCw
            data-icon="inline-start"
            className={activeFetches > 0 ? "animate-spin" : undefined}
          />
          Refresh
        </Button>
      </header>

      <Separator />

      {summaryQuery.isError ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Workforce summary could not be loaded.</p>
            <button
              type="button"
              className="mt-1 underline underline-offset-4"
              onClick={() => void summaryQuery.refetch()}
            >
              Try again
            </button>
          </div>
        </div>
      ) : null}

      <KpiGrid {...summaryProps} loading={summaryQuery.isPending} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <EmployeeStatistics
          className="xl:col-span-2"
          {...summaryProps}
          loading={summaryQuery.isPending}
        />
        <QuickActions />
      </div>

      <ClockActionWidget />
    </div>
  );
}
