import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import type { EmployeeDirectorySummary } from "#features/employees/types/employees-filters.types";

export interface EmployeeStatisticsProps {
  summary?: EmployeeDirectorySummary;
  loading?: boolean;
  className?: string;
}

export function EmployeeStatistics({
  summary,
  loading = false,
  className,
}: EmployeeStatisticsProps) {
  const total = summary?.total ?? 0;
  const activeCount = summary?.active ?? 0;
  const onLeaveCount = summary?.on_leave ?? 0;
  const probationCount = summary?.probation ?? 0;
  const newThisMonthCount = summary?.new_this_month ?? 0;

  const rows = [
    {
      name: "Active Employees",
      count: activeCount,
      color: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
      badgeBg: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      name: "On Approved Leave",
      count: onLeaveCount,
      color: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
      badgeBg: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      name: "Probationary Period",
      count: probationCount,
      color: "bg-purple-500",
      textColor: "text-purple-600 dark:text-purple-400",
      badgeBg: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      name: "Joined This Month",
      count: newThisMonthCount,
      color: "bg-blue-500",
      textColor: "text-blue-600 dark:text-blue-400",
      badgeBg: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
  ] as const;

  const activePercent = total > 0 ? (activeCount / total) * 100 : 0;
  const onLeavePercent = total > 0 ? (onLeaveCount / total) * 100 : 0;
  const probationPercent = total > 0 ? (probationCount / total) * 100 : 0;

  return (
    <section aria-label="Workforce status" className={className}>
      <Card className="h-full overflow-hidden rounded-2xl border border-border/70 bg-card/75 shadow-xs backdrop-blur-sm dark:bg-card/45">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold tracking-tight">
                Workforce Status & Distribution
              </CardTitle>
              <CardDescription className="text-xs">
                Live organizational indicators for active members
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="border-border/80 bg-background/60 text-xs font-semibold"
            >
              {total} Total Records
            </Badge>
          </div>

          {/* Stacked Distribution Progress Bar */}
          {!loading && total > 0 && (
            <div className="mt-3">
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  style={{ width: `${activePercent}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Active: ${Math.round(activePercent)}%`}
                />
                <div
                  style={{ width: `${onLeavePercent}%` }}
                  className="bg-amber-500 transition-all duration-500"
                  title={`On Leave: ${Math.round(onLeavePercent)}%`}
                />
                <div
                  style={{ width: `${probationPercent}%` }}
                  className="bg-purple-500 transition-all duration-500"
                  title={`Probation: ${Math.round(probationPercent)}%`}
                />
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex flex-col gap-2 pt-1">
          {rows.map((row) => {
            const percent = total > 0 ? Math.min(100, Math.round((row.count / total) * 100)) : 0;
            return (
              <div
                key={row.name}
                className="group flex items-center justify-between gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`size-2.5 rounded-full ${row.color} shrink-0 ring-2 ring-background`}
                  />
                  <span className="truncate text-xs font-semibold text-foreground sm:text-sm">
                    {row.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {loading ? (
                    <Skeleton className="h-5 w-16" />
                  ) : (
                    <>
                      <span className="font-mono text-xs font-bold text-foreground sm:text-sm tabular-nums">
                        {row.count}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-semibold ${row.badgeBg}`}
                      >
                        {percent}%
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}
