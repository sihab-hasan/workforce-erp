import { Building2, MapPin, Layers, Users } from "lucide-react";
import { Card } from "@workforce-erp/ui/components/card";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import type { OrganizationSummary } from "../types/organizations.types";

export interface OrganizationKpiCardsProps {
  organizations: OrganizationSummary[];
  totalCount: number;
  loading?: boolean;
}

export function OrganizationKpiCards({
  organizations,
  totalCount,
  loading = false,
}: OrganizationKpiCardsProps) {
  const totalBranches = organizations.reduce((acc, o) => acc + (o.branches_count ?? 0), 0);
  const totalDepartments = organizations.reduce((acc, o) => acc + (o.departments_count ?? 0), 0);
  const totalEmployees = organizations.reduce((acc, o) => acc + (o.employees_count ?? 0), 0);

  const kpis = [
    {
      title: "Business Enterprises",
      value: totalCount,
      description: "Registered corporate entities",
      icon: Building2,
      color: "text-blue-600 bg-blue-500/10 dark:text-blue-400",
    },
    {
      title: "Branch Offices",
      value: totalBranches,
      description: "Regional office footprints",
      icon: MapPin,
      color: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    },
    {
      title: "Business Departments",
      value: totalDepartments,
      description: "Functional operating divisions",
      icon: Layers,
      color: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
    },
    {
      title: "Total Headcount",
      value: totalEmployees,
      description: "Global enterprise workforce",
      icon: Users,
      color: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={kpi.title}
            className="flex items-center gap-4 rounded-xl border border-border/70 bg-card/70 p-4 shadow-xs"
          >
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${kpi.color}`}
            >
              <Icon className="size-5.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{kpi.value}</p>
              <p className="truncate text-[11px] text-muted-foreground">{kpi.description}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
