import { CalendarOff, Clock3, ShieldCheck, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@workforce-erp/ui/components/card";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import type { EmployeeDirectorySummary } from "#features/employees/types/employees-filters.types";

export interface KpiGridProps {
  summary?: EmployeeDirectorySummary;
  loading?: boolean;
  className?: string;
}

export function KpiGrid({ summary, loading = false, className }: KpiGridProps) {
  const items = [
    {
      label: "Total employees",
      value: summary?.total ?? 0,
      caption: "Visible workforce records",
      icon: Users,
    },
    {
      label: "Active",
      value: summary?.active ?? 0,
      caption: "Currently active employees",
      icon: ShieldCheck,
    },
    {
      label: "On leave",
      value: summary?.on_leave ?? 0,
      caption: "Employees currently on leave",
      icon: CalendarOff,
    },
    {
      label: "Probation",
      value: summary?.probation ?? 0,
      caption: "Employees in probation",
      icon: Clock3,
    },
  ] as const;

  return (
    <section aria-label="Workforce indicators" className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} size="sm" className="rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle>{item.label}</CardTitle>
                <CardDescription>{item.caption}</CardDescription>
                <CardAction>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-border">
                    <Icon aria-hidden="true" />
                  </div>
                </CardAction>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-9 w-20" />
                ) : (
                  <p className="font-heading text-3xl font-semibold text-foreground tabular-nums">
                    {item.value.toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
