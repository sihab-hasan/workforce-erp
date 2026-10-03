import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import { Server, Activity, Database, Zap, CheckCircle2, Cpu } from "lucide-react";
import type { SystemHealthStatus } from "../types/dashboard.types";

export interface SystemHealthWidgetProps {
  health?: SystemHealthStatus | undefined;
  loading?: boolean | undefined;
}

export function SystemHealthWidget({ health, loading }: SystemHealthWidgetProps) {
  if (loading || !health) {
    return (
      <Card className="rounded-xl border border-border/70 bg-card/70 shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-52" />
        </CardHeader>
        <CardContent className="space-y-3 pt-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-border/70 bg-card/70 shadow-sm backdrop-blur-sm dark:bg-card/40">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold">Platform Infrastructure</CardTitle>
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
            >
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              Operational
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Real-time cluster health and performance diagnostics
          </CardDescription>
        </div>
        <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20">
          <Server className="size-3.5" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-2">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="size-3.5 text-amber-500" />
              <span>API Latency</span>
            </div>
            <div className="mt-1.5 text-lg font-bold text-foreground sm:text-xl">
              {health.apiLatencyMs}ms
            </div>
            <div className="text-[10px] text-emerald-500 font-medium">Optimal speed</div>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="size-3.5 text-emerald-500" />
              <span>Service Uptime</span>
            </div>
            <div className="mt-1.5 text-lg font-bold text-foreground sm:text-xl">
              {health.uptimePct}%
            </div>
            <div className="text-[10px] text-muted-foreground">30-day SLA</div>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Database className="size-3.5 text-blue-500" />
              <span>Database Engine</span>
            </div>
            <div className="mt-1.5 text-lg font-bold text-foreground sm:text-xl capitalize">
              {health.databaseStatus}
            </div>
            <div className="text-[10px] text-muted-foreground">MySQL Pooled</div>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Cpu className="size-3.5 text-purple-500" />
              <span>Cache Hit Rate</span>
            </div>
            <div className="mt-1.5 text-lg font-bold text-foreground sm:text-xl">
              {health.cacheHitRate}%
            </div>
            <div className="text-[10px] text-purple-500 font-medium">High efficiency</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between border-t border-border/50 pt-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              Runtime:{" "}
              <span className="font-semibold text-foreground">PHP {health.phpVersion}</span>
            </span>
            <span>
              Framework:{" "}
              <span className="font-semibold text-foreground">Laravel {health.laravelVersion}</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="size-3.5" />
            <span>{health.activeWorkers} Background Queue Workers Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
