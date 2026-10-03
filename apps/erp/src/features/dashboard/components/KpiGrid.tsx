import { ArrowUpRight, CalendarOff, Clock3, ShieldCheck, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@workforce-erp/ui/components/card";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import type { EmployeeDirectorySummary } from "#features/employees/types/employees-filters.types";

export interface KpiGridProps {
  summary?: EmployeeDirectorySummary;
  loading?: boolean;
  className?: string;
}

export function KpiGrid({ summary, loading = false, className }: KpiGridProps) {
  const total = summary?.total ?? 0;
  const activeCount = summary?.active ?? 0;
  const activeRate = total > 0 ? Math.round((activeCount / total) * 100) : 100;

  const items = [
    {
      label: "Total Employees",
      value: summary?.total ?? 0,
      caption: "Active workforce directory",
      icon: Users,
      trend: "Total roster",
      gradient: "from-emerald-500 to-teal-400",
      iconBg:
        "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      label: "Active on Duty",
      value: activeCount,
      caption: `${activeRate}% operational capacity`,
      icon: ShieldCheck,
      trend: `${activeRate}% active`,
      gradient: "from-blue-500 to-cyan-400",
      iconBg:
        "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20",
    },
    {
      label: "On Approved Leave",
      value: summary?.on_leave ?? 0,
      caption: "Scheduled time-off",
      icon: CalendarOff,
      trend: "Leaves today",
      gradient: "from-amber-500 to-orange-400",
      iconBg:
        "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20",
    },
    {
      label: "Probation & Onboarding",
      value: summary?.probation ?? 0,
      caption: "New joiner evaluations",
      icon: Clock3,
      trend: "In review",
      gradient: "from-purple-500 to-pink-400",
      iconBg:
        "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border-purple-500/20",
    },
  ] as const;

  return (
    <section aria-label="Workforce indicators" className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.label}
              size="sm"
              className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/75 shadow-xs backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-md dark:bg-card/45"
            >
              {/* Dynamic top gradient line */}
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.gradient} opacity-75 transition-opacity group-hover:opacity-100`}
              />

              <CardHeader className="pt-4 pb-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {item.label}
                  </span>
                  <div
                    className={`flex size-9 items-center justify-center rounded-xl border p-2 shadow-xs transition-transform group-hover:scale-105 ${item.iconBg}`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-1 pb-4">
                {loading ? (
                  <Skeleton className="h-9 w-24 rounded-lg" />
                ) : (
                  <div className="flex items-baseline justify-between">
                    <p className="font-heading text-3xl font-bold tracking-tight text-foreground tabular-nums">
                      {item.value.toLocaleString()}
                    </p>
                    <Badge
                      variant="outline"
                      className="border-border/80 bg-background/60 text-[11px] font-medium"
                    >
                      {item.trend}
                    </Badge>
                  </div>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{item.caption}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
