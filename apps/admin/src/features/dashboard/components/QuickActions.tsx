import { Link } from "react-router-dom";
import { UserPlus, Building2, ShieldCheck, MessageSquare, Sliders, PlusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { ADMIN_PATHS } from "#routes/paths";

export function QuickActions({ className }: { className?: string }) {
  const actions = [
    {
      label: "New Organization",
      description: "Provision a new tenant workspace",
      to: ADMIN_PATHS.tenantCreate,
      icon: PlusCircle,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    },
    {
      label: "Invite Administrator",
      description: "Assign platform operator roles",
      to: ADMIN_PATHS.userCreate,
      icon: UserPlus,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
    },
    {
      label: "Tenant Management",
      description: "Inspect active organizations & subscriptions",
      to: ADMIN_PATHS.organizations,
      icon: Building2,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
    },
    {
      label: "Contact Inquiries",
      description: "View and respond to customer lead requests",
      to: ADMIN_PATHS.inquiries,
      icon: MessageSquare,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
    },
    {
      label: "Security Audit Center",
      description: "Review security logs & MFA status",
      to: ADMIN_PATHS.settings,
      icon: ShieldCheck,
      iconColor: "text-rose-500",
      iconBg: "bg-rose-500/10 dark:bg-rose-500/20",
    },
    {
      label: "System Settings",
      description: "Configure environment & security policy",
      to: ADMIN_PATHS.settings,
      icon: Sliders,
      iconColor: "text-indigo-500",
      iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    },
  ];

  return (
    <Card
      className={`rounded-xl border border-border/70 bg-card/70 shadow-sm backdrop-blur-sm dark:bg-card/40 ${className ?? ""}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">Platform Quick Actions</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Accelerated administration and tenant provisioning workflows
        </CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <Link
              key={idx}
              to={act.to}
              className="group flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-muted/50 hover:shadow-xs"
            >
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${act.iconBg} ${act.iconColor} transition-transform group-hover:scale-105`}
              >
                <Icon className="size-4.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {act.label}
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-1">
                  {act.description}
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
