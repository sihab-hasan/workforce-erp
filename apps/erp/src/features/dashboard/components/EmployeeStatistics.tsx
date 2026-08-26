import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Separator } from "@workforce-erp/ui/components/separator";
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
  const rows = [
    { name: "Active employees", count: summary?.active ?? 0 },
    { name: "On leave", count: summary?.on_leave ?? 0 },
    { name: "Probation", count: summary?.probation ?? 0 },
    { name: "New this month", count: summary?.new_this_month ?? 0 },
  ] as const;

  return (
    <section aria-label="Workforce status" className={className}>
      <Card className="h-full rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Workforce Status</CardTitle>
          <CardDescription>Live employee indicators from the current API scope</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {rows.map((row, index) => {
            const percent = total > 0 ? Math.min(100, Math.round((row.count / total) * 100)) : 0;
            return (
              <div key={row.name}>
                {index > 0 ? <Separator className="my-1" /> : null}
                <div className="flex items-center gap-3 py-2">
                  <span className="w-36 shrink-0 text-sm text-foreground">{row.name}</span>
                  <div className="flex-1">
                    {loading ? (
                      <Skeleton className="h-1.5 w-full" />
                    ) : (
                      <div
                        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${row.name}: ${percent}%`}
                      >
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex w-24 items-center justify-end gap-2">
                    {loading ? (
                      <Skeleton className="h-5 w-12" />
                    ) : (
                      <span className="text-sm font-medium tabular-nums">{row.count}</span>
                    )}
                    <Badge variant="outline">{percent}%</Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}
