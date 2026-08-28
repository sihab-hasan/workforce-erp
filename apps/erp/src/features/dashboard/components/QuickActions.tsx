import { Link, useParams } from "react-router-dom";
import { Building2, CalendarPlus, Timer, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Button } from "@workforce-erp/ui/components/button";
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
            label: "Employees",
            description: "Manage workforce directory & profiles",
            to: companyRoutes.employees(validTenant, validCompany),
            icon: Users,
          },
          {
            label: "Timesheets",
            description: "Track hours, shifts & punch logs",
            to: companyRoutes.timesheets(validTenant, validCompany),
            icon: Timer,
          },
          {
            label: "Request Leave",
            description: "Submit time-off application",
            to: companyRoutes.leaveCreate(validTenant, validCompany),
            icon: CalendarPlus,
          },
          {
            label: "Departments",
            description: "View branches and business units",
            to: companyRoutes.departments(validTenant, validCompany),
            icon: Building2,
          },
        ]
      : [];

  return (
    <section aria-label="Quick actions" className={className}>
      <Card className="h-full rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          <CardDescription>Direct shortcuts to essential operational workflows</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto min-h-20 flex-col items-start justify-start gap-1.5 rounded-xl p-3.5 text-left transition-all hover:bg-muted/60 hover:border-primary/40"
                render={<Link to={action.to} />}
                nativeButton={false}
              >
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                  <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-3.5" aria-hidden="true" />
                  </span>
                  {action.label}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{action.description}</p>
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}
