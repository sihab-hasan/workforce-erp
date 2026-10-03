import { Activity, Database, Cpu, RefreshCw, Trash2, Download, Server, Layers } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import type { PlatformSettings, SystemHealthData } from "../types/settings.types";

interface SystemHealthTabProps {
  health?: SystemHealthData | undefined;
  settings?: PlatformSettings | undefined;
  isLoading: boolean;
  onRefresh: () => void;
  onClearCache: () => Promise<unknown>;
  isClearingCache: boolean;
}

export function SystemHealthTab({
  health,
  settings,
  isLoading,
  onRefresh,
  onClearCache,
  isClearingCache,
}: SystemHealthTabProps) {
  const handleExportConfig = () => {
    if (!settings) return;
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workforce-platform-settings-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card/60 shadow-sm backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Database Engine
              </span>
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold capitalize">
                  {health?.db_driver || "MySQL (Active)"}
                </span>
              </div>
            </div>
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Database className="size-4.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 shadow-sm backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Framework Runtime
              </span>
              <div className="text-sm font-bold">Laravel {health?.laravel_version || "12.x"}</div>
            </div>
            <div className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
              <Server className="size-4.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 shadow-sm backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                PHP Environment
              </span>
              <div className="text-sm font-bold">
                PHP {health?.php_version ? health.php_version.split("-")[0] : "8.2.x"}
              </div>
            </div>
            <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <Cpu className="size-4.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 shadow-sm backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Platform Uptime
              </span>
              <div className="text-sm font-bold text-emerald-500">{health?.uptime || "99.98%"}</div>
            </div>
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Activity className="size-4.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card/60 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="size-5 text-primary" />
              <div>
                <CardTitle className="text-base font-bold">
                  Maintenance & Optimization Tools
                </CardTitle>
                <CardDescription className="text-xs">
                  Run system diagnostics, flush cache clusters, or export global configurations.
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Health
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border border-border/60 p-4 bg-muted/20">
            <div>
              <div className="text-xs font-semibold text-foreground">
                Flush Application & View Cache
              </div>
              <div className="text-[11px] text-muted-foreground">
                Clears configuration cache, route cache, blade compiled views, and temporary
                sessions.
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onClearCache()}
              disabled={isClearingCache}
              className="gap-2 shrink-0 text-xs"
            >
              <Trash2 className="size-3.5" />
              {isClearingCache ? "Flushing..." : "Flush Platform Cache"}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border border-border/60 p-4 bg-muted/20">
            <div>
              <div className="text-xs font-semibold text-foreground">
                Export Global Configuration Snapshot
              </div>
              <div className="text-[11px] text-muted-foreground">
                Download current environment policy, tenant quotas, and security configuration as
                JSON.
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportConfig}
              className="gap-2 shrink-0 text-xs"
            >
              <Download className="size-3.5" />
              Export Config JSON
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
