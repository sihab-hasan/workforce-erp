import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CreditCard } from "lucide-react";
import type { PlanBreakdownItem } from "../types/dashboard.types";

export interface SubscriptionDistributionProps {
  plans?: PlanBreakdownItem[] | undefined;
  loading?: boolean | undefined;
}

export function SubscriptionDistribution({ plans, loading }: SubscriptionDistributionProps) {
  if (loading || !plans || plans.length === 0) {
    return (
      <Card className="h-full rounded-xl border border-border/70 bg-card/70 shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-56" />
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center pt-4">
          <Skeleton className="size-40 rounded-full" />
          <div className="mt-4 w-full space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSubs = plans.reduce((acc, p) => acc + p.value, 0);

  return (
    <Card className="flex h-full flex-col rounded-xl border border-border/70 bg-card/70 shadow-sm backdrop-blur-sm dark:bg-card/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">Subscription Tiers</CardTitle>
          <div className="flex size-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-500 dark:bg-purple-500/20">
            <CreditCard className="size-3.5" />
          </div>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Tenant breakdown by active subscription package
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between pt-2">
        <div className="relative h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={plans}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {plans.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length && payload[0]) {
                    const item = payload[0].payload as PlanBreakdownItem;
                    const pct = totalSubs > 0 ? Math.round((item.value / totalSubs) * 100) : 0;
                    return (
                      <div className="rounded-lg border border-border bg-background/95 p-2.5 shadow-lg backdrop-blur-md">
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                          <span
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.name}
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                          <span>{item.price}</span>
                          <span className="font-bold text-foreground">
                            {item.value} orgs ({pct}%)
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-medium text-muted-foreground">Total</span>
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              {totalSubs}
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
          {plans.map((p, idx) => {
            const pct = totalSubs > 0 ? Math.round((p.value / totalSubs) * 100) : 0;
            return (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="truncate font-medium text-foreground">{p.name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                  <span>{p.price}</span>
                  <span className="font-semibold text-foreground">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
