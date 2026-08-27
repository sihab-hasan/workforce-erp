import { Link } from "react-router-dom";
import { UserPlus, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Button } from "@workforce-erp/ui/components/button";
import { ADMIN_PATHS } from "#routes/paths";

const actions = [
  {
    label: "Create User",
    description: "Invite a new platform user",
    to: ADMIN_PATHS.userCreate,
    icon: UserPlus,
  },
  {
    label: "Manage Users",
    description: "Review accounts and access status",
    to: ADMIN_PATHS.users,
    icon: Users,
  },
] as const;

export function QuickActions({ className }: { className?: string }) {
  return (
    <section aria-label="Quick actions" className={className}>
      <Card className="h-full rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Actions backed by the current API contract</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2">
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
                  <p className="text-sm font-medium">{action.label}</p>
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
