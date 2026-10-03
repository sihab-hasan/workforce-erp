import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Progress } from "@workforce-erp/ui/components/progress";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import { Layers, TrendingUp } from "lucide-react";
import type { ModuleAdoptionItem } from "../types/dashboard.types";

export interface ModuleAdoptionMatrixProps {
  modules?: ModuleAdoptionItem[] | undefined;
  loading?: boolean | undefined;
}

export function ModuleAdoptionMatrix({ modules, loading }: ModuleAdoptionMatrixProps) {
  if (loading || !modules || modules.length === 0) {
    return (
      <Card className="rounded-xl border border-border/70 bg-card/70 shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3.5 w-60" />
        </CardHeader>
        <CardContent className="space-y-4 pt-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-border/70 bg-card/70 shadow-sm backdrop-blur-sm dark:bg-card/40">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-bold">Module Adoption Health</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Feature utilization across enterprise organizations
          </CardDescription>
        </div>
        <div className="flex size-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-500 dark:bg-blue-500/20">
          <Layers className="size-3.5" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-3">
        {modules.map((m, idx) => (
          <div key={idx} className="group space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <span className="size-1.5 rounded-full bg-primary/60 group-hover:bg-primary" />
                <span className="truncate">{m.module}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-semibold text-foreground">{m.usagePct}%</span>
                <span className="text-[10px] text-muted-foreground">({m.active} orgs)</span>
                <Badge
                  variant="outline"
                  className="border-emerald-500/20 bg-emerald-500/10 px-1 py-0 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
                >
                  <TrendingUp className="mr-0.5 size-2.5" />
                  {m.trend}
                </Badge>
              </div>
            </div>

            <Progress value={m.usagePct} className="h-2 bg-muted/60" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
