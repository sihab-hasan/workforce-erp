import { Card, CardContent } from "@workforce-erp/ui/components/card";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import { DollarSign, Building2, Users, ShieldCheck, TrendingUp, ArrowUpRight } from "lucide-react";
import type { PlatformMetrics } from "../types/dashboard.types";

export type AdminAccountMetrics = {
  total: number;
  active: number;
  invited: number;
  suspended: number;
};

export interface KpiGridProps {
  metrics?: PlatformMetrics | undefined;
  loading?: boolean | undefined;
}

export function KpiGrid({ metrics, loading }: KpiGridProps) {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card
            key={idx}
            className="relative overflow-hidden border border-border/60 bg-card/60 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="mt-3 h-8 w-28" />
            <Skeleton className="mt-2 h-4 w-36" />
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Estimated MRR",
      value: `$${metrics.mrr.toLocaleString()}`,
      growth: metrics.mrrGrowth,
      growthPositive: true,
      description: `Across ${metrics.activeTenants} active organizations`,
      icon: DollarSign,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20",
    },
    {
      title: "Active Tenants",
      value: metrics.totalTenants.toLocaleString(),
      growth: metrics.tenantsGrowth,
      growthPositive: true,
      description: `${metrics.trialTenants} in active evaluation trial`,
      icon: Building2,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20",
    },
    {
      title: "Total Platform Users",
      value: metrics.totalUsers.toLocaleString(),
      growth: metrics.usersGrowth,
      growthPositive: true,
      description: `${metrics.activeUsers} active · ${metrics.invitedUsers} invited`,
      icon: Users,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/20",
    },
    {
      title: "Security & MFA Shield",
      value: metrics.mfaEnforcementRate,
      growth: `${metrics.securityEvents} events`,
      growthPositive: true,
      description: "0 active vulnerabilities detected",
      icon: ShieldCheck,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className="group relative overflow-hidden border border-border/70 bg-card/70 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-md dark:bg-card/40"
          >
            {/* Top gradient accent line */}
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80 transition-opacity group-hover:opacity-100 ${
                idx === 0
                  ? "from-emerald-500 to-teal-400"
                  : idx === 1
                    ? "from-blue-500 to-cyan-400"
                    : idx === 2
                      ? "from-purple-500 to-pink-400"
                      : "from-amber-500 to-orange-400"
              }`}
            />

            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {card.title}
                </span>
                <div
                  className={`flex size-9 items-center justify-center rounded-lg border ${card.iconBg} ${card.iconColor} transition-transform duration-200 group-hover:scale-105`}
                >
                  <Icon className="size-4.5" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                  {card.value}
                </div>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                >
                  <TrendingUp className="size-3" />
                  {card.growth}
                </Badge>
              </div>

              <div className="mt-2.5 flex items-center justify-between border-t border-border/50 pt-2.5 text-xs text-muted-foreground">
                <span className="truncate">{card.description}</span>
                <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
