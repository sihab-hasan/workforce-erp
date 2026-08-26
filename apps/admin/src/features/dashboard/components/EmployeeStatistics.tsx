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
import type { AdminAccountMetrics } from "./KpiGrid";

export function EmployeeStatistics({
  metrics,
  loading = false,
  className,
}: {
  metrics?: AdminAccountMetrics;
  loading?: boolean;
  className?: string;
}) {
  const total = metrics?.total ?? 0;
  const rows = [
    { name: "Active", count: metrics?.active ?? 0 },
    { name: "Invited", count: metrics?.invited ?? 0 },
    { name: "Suspended", count: metrics?.suspended ?? 0 },
  ] as const;

  return (
    <section aria-label="Account status" className={className}>
      <Card className="h-full rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
          <CardDescription>Live account totals from the user-management API</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {rows.map((row, index) => {
            const percent = total > 0 ? Math.round((row.count / total) * 100) : 0;
            return (
              <div key={row.name}>
                {index > 0 ? <Separator className="my-1" /> : null}
                <div className="flex items-center gap-3 py-2">
                  <span className="w-28 shrink-0 text-sm">{row.name}</span>
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
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex w-24 items-center justify-end gap-2">
                    {loading ? (
                      <Skeleton className="h-5 w-10" />
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
