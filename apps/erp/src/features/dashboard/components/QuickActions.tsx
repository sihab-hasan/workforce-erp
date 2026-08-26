import { Link, useParams } from "react-router-dom";
import { Timer, Users } from "lucide-react";
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
  const actions =
    tenantKey && companyKey
      ? [
          {
            label: "Employees",
            description: "Open the live employee directory",
            to: companyRoutes.employees(tenantKey, companyKey),
            icon: Users,
          },
          {
            label: "Timesheets",
            description: "Track and review working time",
            to: companyRoutes.timesheets(tenantKey, companyKey),
            icon: Timer,
          },
        ]
      : [];

  return (
    <section aria-label="Quick actions" className={className}>
      <Card className="h-full rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Shortcuts backed by the current API contract</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto min-h-24 flex-col items-start justify-start gap-2 rounded-lg py-4 text-left"
                render={<Link to={action.to} />}
                nativeButton={false}
              >
                <Icon data-icon="inline-start" aria-hidden="true" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="text-sm font-medium text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}
