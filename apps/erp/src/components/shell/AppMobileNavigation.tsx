import type { ComponentType } from "react";
import { Link, useParams } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@workforce-erp/ui/components/dropdown-menu";
import { cn } from "@workforce-erp/ui/lib/utils";
import {
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MoreHorizontal,
  Settings,
  ShieldCheck,
  Timer,
  Users,
  Workflow,
} from "lucide-react";
import { companyRoutes, tenantRoutes } from "#routes/paths";
import { useAuthorization } from "@workforce-erp/authorization";

type NavigationRoute = {
  key: string;
  title: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  permissions?: readonly string[];
};

function isRouteActive(route: NavigationRoute, currentPath: string) {
  return currentPath === route.path || currentPath.startsWith(`${route.path}/`);
}

export function AppMobileNavigation({ currentPath }: { currentPath: string }) {
  const { tenantKey, companyKey } = useParams();
  const authorization = useAuthorization();

  const routes: NavigationRoute[] =
    tenantKey && companyKey
      ? [
          {
            key: "dashboard",
            title: "Dashboard",
            path: companyRoutes.dashboard(tenantKey, companyKey),
            icon: LayoutDashboard,
          },
          {
            key: "departments",
            title: "Departments",
            path: companyRoutes.departments(tenantKey, companyKey),
            icon: Building2,
            permissions: ["department.manage"],
          },
          {
            key: "employees",
            title: "Employees",
            path: companyRoutes.employees(tenantKey, companyKey),
            icon: Users,
            permissions: ["employee.read"],
          },
          {
            key: "leave",
            title: "Leave",
            path: companyRoutes.leave(tenantKey, companyKey),
            icon: ClipboardList,
            permissions: ["leave.manage", "leave.approve"],
          },
          {
            key: "timesheets",
            title: "Timesheets",
            path: companyRoutes.timesheets(tenantKey, companyKey),
            icon: Timer,
            permissions: ["timesheet.manage", "timesheet.manage"],
          },
          {
            key: "approvals",
            title: "Approvals",
            path: companyRoutes.approvals(tenantKey, companyKey),
            icon: CheckCircle2,
            permissions: ["approval.approve"],
          },
          {
            key: "documents",
            title: "Documents",
            path: companyRoutes.documents(tenantKey, companyKey),
            icon: FileText,
            permissions: ["document.manage"],
          },
          {
            key: "reports",
            title: "Reports",
            path: companyRoutes.reports(tenantKey, companyKey),
            icon: Workflow,
            permissions: ["report.view"],
          },
          {
            key: "notifications",
            title: "Notifications",
            path: companyRoutes.notifications(tenantKey, companyKey),
            icon: Bell,
            permissions: ["notification.view"],
          },
        ]
      : tenantKey
        ? [
            {
              key: "organization",
              title: "Organization",
              path: tenantRoutes.organization(tenantKey),
              icon: Building2,
              permissions: ["organization.manage"],
            },
            {
              key: "companies",
              title: "Companies",
              path: tenantRoutes.companies(tenantKey),
              icon: LayoutDashboard,
              permissions: ["company.manage"],
            },
            {
              key: "users",
              title: "Users",
              path: tenantRoutes.users(tenantKey),
              icon: Users,
              permissions: ["user.manage"],
            },
            {
              key: "roles",
              title: "Roles",
              path: tenantRoutes.roles(tenantKey),
              icon: ShieldCheck,
              permissions: ["role.manage"],
            },
            {
              key: "settings",
              title: "Settings",
              path: tenantRoutes.settings(tenantKey),
              icon: Settings,
            },
          ]
        : [];

  const visibleRoutes = routes.filter(
    (route) => !route.permissions || authorization.canAny(route.permissions),
  );

  if (!visibleRoutes.length) return null;

  const primaryRoutes = visibleRoutes.slice(0, 4);
  const overflowRoutes = visibleRoutes.slice(4);
  const isOverflowActive = overflowRoutes.some((route) => isRouteActive(route, currentPath));

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-background/85 md:hidden"
      aria-label="Mobile navigation"
    >
      <div className={cn("grid gap-1", overflowRoutes.length ? "grid-cols-5" : "grid-cols-4")}>
        {primaryRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = isRouteActive(route, currentPath);
          return (
            <Link
              key={route.key}
              to={route.path}
              className={cn(
                "flex min-w-0 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-center transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg transition-colors",
                  isActive ? "bg-background text-primary shadow-sm" : "",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span
                className={cn(
                  "w-full truncate text-[9px] leading-tight font-semibold",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {route.title}
              </span>
            </Link>
          );
        })}

        {overflowRoutes.length ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className={cn(
                    "flex min-w-0 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-center transition-colors",
                    isOverflowActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                />
              }
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg transition-colors",
                  isOverflowActive ? "bg-background text-primary shadow-sm" : "",
                )}
              >
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </span>
              <span
                className={cn(
                  "w-full truncate text-[9px] leading-tight font-semibold",
                  isOverflowActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                More
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" sideOffset={10} className="w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel>More destinations</DropdownMenuLabel>
                {overflowRoutes.map((route) => {
                  const Icon = route.icon;
                  const isActive = isRouteActive(route, currentPath);
                  return (
                    <DropdownMenuItem
                      key={route.key}
                      render={<Link to={route.path} />}
                      className={cn(isActive ? "bg-accent text-accent-foreground" : "")}
                    >
                      <Icon aria-hidden="true" />
                      <span className="truncate">{route.title}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </nav>
  );
}
