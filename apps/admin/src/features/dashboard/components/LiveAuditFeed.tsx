import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import { Shield, ShieldAlert, ShieldCheck, Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { ADMIN_PATHS } from "#routes/paths";
import type { AuditEventItem } from "../types/dashboard.types";

export interface LiveAuditFeedProps {
  events?: AuditEventItem[] | undefined;
  loading?: boolean | undefined;
}

export function LiveAuditFeed({ events, loading }: LiveAuditFeedProps) {
  const [filter, setFilter] = useState<string>("all");

  if (loading || !events || events.length === 0) {
    return (
      <Card className="rounded-xl border border-border/70 bg-card/70 shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3.5 w-64" />
        </CardHeader>
        <CardContent className="space-y-3 pt-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const filteredEvents = filter === "all" ? events : events.filter((e) => e.severity === filter);

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
    } catch {
      return "Recent";
    }
  };

  const getSeverityBadge = (severity: AuditEventItem["severity"]) => {
    switch (severity) {
      case "critical":
        return (
          <Badge
            variant="outline"
            className="border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
          >
            Critical
          </Badge>
        );
      case "warning":
        return (
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          >
            Elevated
          </Badge>
        );
      case "info":
        return (
          <Badge
            variant="outline"
            className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
          >
            Auth
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          >
            Success
          </Badge>
        );
    }
  };

  return (
    <Card className="flex h-full flex-col rounded-xl border border-border/70 bg-card/70 shadow-sm backdrop-blur-sm dark:bg-card/40">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold">Platform Security & Audit Feed</CardTitle>
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Immutable live log of administrative and authentication operations
          </CardDescription>
        </div>
        <div className="flex size-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
          <Shield className="size-3.5" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between pt-2">
        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-border/50">
          {["all", "critical", "warning", "info", "success"].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setFilter(sev)}
              className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize transition-all ${
                filter === sev
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Event List */}
        <div className="mt-3 flex-1 space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
          {filteredEvents.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
              No audit events match this filter.
            </div>
          ) : (
            filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="group flex items-start justify-between gap-3 rounded-lg border border-border/40 bg-muted/20 p-2.5 transition-colors hover:border-border hover:bg-muted/40"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    {evt.severity === "critical" ? (
                      <ShieldAlert className="size-4 text-red-500" />
                    ) : evt.severity === "warning" ? (
                      <ShieldAlert className="size-4 text-amber-500" />
                    ) : (
                      <ShieldCheck className="size-4 text-emerald-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground truncate">
                        {evt.action}
                      </span>
                      {getSeverityBadge(evt.severity)}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground truncate">
                      <span className="truncate">{evt.actor}</span>
                      <span>·</span>
                      <span className="font-mono text-[10px]">{evt.ip}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-[10px] text-muted-foreground">
                  <Clock className="size-3" />
                  <span>{formatTimeAgo(evt.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-3 border-t border-border/50 pt-2.5 text-center">
          <Link
            to={ADMIN_PATHS.settings}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>View enterprise security center</span>
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
