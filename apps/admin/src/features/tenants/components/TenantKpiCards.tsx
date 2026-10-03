import { Card, CardContent } from "@workforce-erp/ui/components/card";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import { Building2, CheckCircle2, Clock, DollarSign } from "lucide-react";
import type { TenantSummary } from "../types/tenants.types";

export interface TenantKpiCardsProps {
  tenants?: TenantSummary[] | undefined;
  totalCount?: number | undefined;
  loading?: boolean | undefined;
}

export function TenantKpiCards({ tenants = [], totalCount = 0, loading }: TenantKpiCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="border border-border/60 bg-card/60 p-4 shadow-sm">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-7 w-20" />
          </Card>
        ))}
      </div>
    );
  }

  const activeCount = tenants.filter((t) => t.status === "active").length;
  const trialCount = tenants.filter(
    (t) => t.status === "trial" || t.subscription_status === "trial" || t.plan === "trial",
  ).length;
  const enterpriseCount = tenants.filter(
    (t) => t.plan === "enterprise" || t.plan === "business",
  ).length;

  const cards = [
    {
      title: "Total Tenants",
      value: totalCount || tenants.length,
      badge: "Provisioned",
      icon: Building2,
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Active Workspaces",
      value: activeCount,
      badge: `${totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 100}% Active`,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Trial Evaluations",
      value: trialCount,
      badge: "14-Day Free",
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Enterprise Tier",
      value: enterpriseCount,
      badge: "High Value",
      icon: DollarSign,
      color: "text-purple-500",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <Card key={idx} className="border border-border/70 bg-card/70 shadow-xs backdrop-blur-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {c.title}
                </p>
                <div className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                  {c.value}
                </div>
                <Badge variant="outline" className="mt-1.5 px-1.5 py-0 text-[10px] font-medium">
                  {c.badge}
                </Badge>
              </div>
              <div
                className={`flex size-10 items-center justify-center rounded-xl border ${c.bg} ${c.color}`}
              >
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
