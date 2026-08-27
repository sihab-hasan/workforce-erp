import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@workforce-erp/auth";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Button } from "@workforce-erp/ui/components/button";
import { Separator } from "@workforce-erp/ui/components/separator";
import { AlertCircle, CalendarDays, RefreshCw } from "lucide-react";
import { EmployeeStatistics } from "#features/dashboard/components/EmployeeStatistics";
import { KpiGrid, type AdminAccountMetrics } from "#features/dashboard/components/KpiGrid";
import { QuickActions } from "#features/dashboard/components/QuickActions";
import { useUsers } from "#features/users/hooks/use-users";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function totalOf(query: ReturnType<typeof useUsers>) {
  return query.data?.meta?.total ?? 0;
}

export default function DashboardPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const activeFetches = useIsFetching();
  const all = useUsers({ page: 1, per_page: 1 });
  const active = useUsers({ page: 1, per_page: 1, status: "active" });
  const invited = useUsers({ page: 1, per_page: 1, status: "invited" });
  const suspended = useUsers({ page: 1, per_page: 1, status: "suspended" });
  const queries = [all, active, invited, suspended];
  const loading = queries.some((query) => query.isPending);
  const hasError = queries.some((query) => query.isError);
  const metrics: AdminAccountMetrics = {
    total: totalOf(all),
    active: totalOf(active),
    invited: totalOf(invited),
    suspended: totalOf(suspended),
  };
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
  const firstName = session?.user.name?.trim().split(/\s+/)[0] || "Administrator";

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-0">
      <header className="flex flex-col gap-4 rounded-lg border border-border bg-card/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between lg:p-5">
        <div className="min-w-0">
          <Badge variant="outline" className="gap-1.5">
            <CalendarDays data-icon="inline-start" />
            {formattedDate}
          </Badge>
          <h2 className="mt-3 font-heading text-2xl font-semibold sm:text-3xl">
            {greeting()}, {firstName}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Live user-account health for the administration scope available to your account.
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

      {hasError ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Some account metrics could not be loaded.</p>
            <button
              type="button"
              className="mt-1 underline underline-offset-4"
              onClick={() => void queryClient.invalidateQueries({ queryKey: ["users"] })}
            >
              Try again
            </button>
          </div>
        </div>
      ) : null}

      <KpiGrid metrics={metrics} loading={loading} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <EmployeeStatistics className="lg:col-span-2" metrics={metrics} loading={loading} />
        <QuickActions />
      </div>
    </div>
  );
}
