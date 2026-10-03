import { Link, useParams } from "react-router-dom";
import { Building2, CalendarPlus, ChevronRight, Timer, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { companyRoutes } from "#routes/paths";

export interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const { tenantKey, companyKey } = useParams();
  const validTenant = tenantKey ?? "";
  const validCompany = companyKey ?? "";

  const actions =
    tenantKey && companyKey
      ? [
          {
            label: "Employees Directory",
            description: "Profiles, onboarding & records",
            to: companyRoutes.employees(validTenant, validCompany),
            icon: Users,
            color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
          },
          {
            label: "Timesheets & Shifts",
            description: "Daily hours, clock logs & approvals",
            to: companyRoutes.timesheets(validTenant, validCompany),
            icon: Timer,
            color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
          },
          {
            label: "Request Time-Off",
            description: "Apply for leave or review balance",
            to: companyRoutes.leaveCreate(validTenant, validCompany),
            icon: CalendarPlus,
            color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
          },
          {
            label: "Departments & Units",
            description: "Organization branches & structure",
            to: companyRoutes.departments(validTenant, validCompany),
            icon: Building2,
            color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
          },
        ]
      : [];

  return (
    <section aria-label="Quick actions" className={className}>
      <Card className="h-full overflow-hidden rounded-2xl border border-border/70 bg-card/75 shadow-xs backdrop-blur-sm dark:bg-card/45">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold tracking-tight">Quick Actions</CardTitle>
          <CardDescription className="text-xs">Direct shortcuts to daily operational workflows</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2.5">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                to={action.to}
                className="group flex items-center justify-between rounded-xl border border-border/60 bg-background/50 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-muted/40 hover:shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex size-9 items-center justify-center rounded-xl border ${action.color} shadow-xs transition-transform group-hover:scale-105 shrink-0`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors sm:text-sm">
                      {action.label}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">{action.description}</p>
                  </div>
                </div>

                <ChevronRight className="size-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground shrink-0" />
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}
