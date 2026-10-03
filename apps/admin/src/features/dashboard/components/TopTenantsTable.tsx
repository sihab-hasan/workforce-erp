import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Button } from "@workforce-erp/ui/components/button";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import { Users, ArrowUpRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ADMIN_PATHS, adminOrganizationDetailsPath } from "#routes/paths";
import type { TopOrganizationItem } from "../types/dashboard.types";

export interface TopTenantsTableProps {
  organizations?: TopOrganizationItem[] | undefined;
  loading?: boolean | undefined;
}

export function TopTenantsTable({ organizations, loading }: TopTenantsTableProps) {
  if (loading || !organizations || organizations.length === 0) {
    return (
      <Card className="rounded-xl border border-border/70 bg-card/70 shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-72" />
        </CardHeader>
        <CardContent className="space-y-3 pt-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const getPlanBadge = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "enterprise":
        return (
          <Badge
            variant="outline"
            className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400"
          >
            Enterprise
          </Badge>
        );
      case "business":
      case "pro":
        return (
          <Badge
            variant="outline"
            className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
          >
            Pro Plan
          </Badge>
        );
      case "starter":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          >
            Starter
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          >
            Trial
          </Badge>
        );
    }
  };

  return (
    <Card className="rounded-xl border border-border/70 bg-card/70 shadow-sm backdrop-blur-sm dark:bg-card/40">
      <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base font-bold sm:text-lg">
            Active Tenant Organizations
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Top enterprise workspaces provisioned on Workforce ERP
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={<Link to={ADMIN_PATHS.organizations} />}
          className="h-8 gap-1 text-xs"
        >
          <span>All Organizations</span>
          <ChevronRight className="size-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="pb-2.5 font-medium">Organization</th>
                <th className="pb-2.5 font-medium">Subscription</th>
                <th className="pb-2.5 font-medium text-center">Members</th>
                <th className="pb-2.5 font-medium text-center">Status</th>
                <th className="pb-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {organizations.map((org) => (
                <tr key={org.id} className="group transition-colors hover:bg-muted/30">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary font-bold">
                        {org.name[0]?.toUpperCase() || "O"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {org.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono truncate">
                          /{org.slug}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3">{getPlanBadge(org.plan)}</td>

                  <td className="py-3 text-center">
                    <div className="inline-flex items-center gap-1 font-medium text-foreground">
                      <Users className="size-3 text-muted-foreground" />
                      <span>{org.members_count}</span>
                    </div>
                  </td>

                  <td className="py-3 text-center">
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 bg-emerald-500/10 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
                    >
                      Active
                    </Badge>
                  </td>

                  <td className="py-3 text-right">
                    <Link
                      to={adminOrganizationDetailsPath(org.id)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                    >
                      <span>Manage</span>
                      <ArrowUpRight className="size-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
