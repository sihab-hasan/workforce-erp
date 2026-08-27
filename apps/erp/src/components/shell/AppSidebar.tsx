import {
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Timer,
  Users,
  Workflow,
} from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@workforce-erp/ui/components/sidebar";
import { Avatar, AvatarFallback } from "@workforce-erp/ui/components/avatar";
import { Badge } from "@workforce-erp/ui/components/badge";
import { useAuth } from "@workforce-erp/auth";
import { useAuthorization } from "@workforce-erp/authorization";
import { ERP_PATHS, companyRoutes, tenantRoutes } from "#routes/paths";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions?: readonly string[];
}

function activePath(currentPath: string, target: string) {
  return currentPath === target || currentPath.startsWith(`${target}/`);
}

export function AppSidebar() {
  const { tenantKey, companyKey } = useParams();
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const { session } = useAuth();
  const authorization = useAuthorization();
  const user = session?.user;

  const validTenantKey = tenantKey ?? "";
  const validCompanyKey = companyKey ?? "";
  const tenantBase = tenantKey ? tenantRoutes.root(tenantKey) : "";
  const companyBase = tenantKey && companyKey ? companyRoutes.root(tenantKey, companyKey) : "";

  const companyItems: NavItem[] = companyBase
    ? [
        {
          label: "Dashboard",
          path: companyRoutes.dashboard(validTenantKey, validCompanyKey),
          icon: LayoutDashboard,
        },
        {
          label: "Departments",
          path: companyRoutes.departments(validTenantKey, validCompanyKey),
          icon: Building2,
          permissions: ["department.manage"],
        },
        {
          label: "Employees",
          path: companyRoutes.employees(validTenantKey, validCompanyKey),
          icon: Users,
          permissions: ["employee.view"],
        },
        {
          label: "Leave",
          path: companyRoutes.leave(validTenantKey, validCompanyKey),
          icon: ClipboardList,
          permissions: ["leave.request", "leave.review"],
        },
        {
          label: "Timesheets",
          path: companyRoutes.timesheets(validTenantKey, validCompanyKey),
          icon: Timer,
          permissions: ["timesheet.manage", "timesheet.review"],
        },
        {
          label: "Approvals",
          path: companyRoutes.approvals(validTenantKey, validCompanyKey),
          icon: CheckCircle2,
          permissions: ["approval.review"],
        },
        {
          label: "Documents",
          path: companyRoutes.documents(validTenantKey, validCompanyKey),
          icon: FileText,
          permissions: ["document.manage"],
        },
        {
          label: "Reports",
          path: companyRoutes.reports(validTenantKey, validCompanyKey),
          icon: Workflow,
          permissions: ["report.view"],
        },
        {
          label: "Notifications",
          path: companyRoutes.notifications(validTenantKey, validCompanyKey),
          icon: Bell,
          permissions: ["notification.view"],
        },
      ]
    : [];

  const organizationItems: NavItem[] = tenantBase
    ? [
        {
          label: "Organization",
          path: tenantRoutes.organization(validTenantKey),
          icon: Building2,
          permissions: ["organization.manage"],
        },
        {
          label: "Companies",
          path: tenantRoutes.companies(validTenantKey),
          icon: LayoutDashboard,
          permissions: ["company.manage"],
        },
        {
          label: "Users",
          path: tenantRoutes.users(validTenantKey),
          icon: Users,
          permissions: ["user.manage"],
        },
        {
          label: "Roles",
          path: tenantRoutes.roles(validTenantKey),
          icon: ShieldCheck,
          permissions: ["role.manage"],
        },
        { label: "Settings", path: tenantRoutes.settings(validTenantKey), icon: Settings },
      ]
    : [];

  const visibleCompanyItems = companyItems.filter(
    (item) => !item.permissions || authorization.canAny(item.permissions),
  );
  const visibleOrganizationItems = organizationItems.filter(
    (item) => !item.permissions || authorization.canAny(item.permissions),
  );

  const sections = companyBase
    ? [{ label: "Company workspace", items: visibleCompanyItems }]
    : [{ label: "Organization workspace", items: visibleOrganizationItems }];

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-sidebar-border">
      <SidebarHeader className="p-3">
        <Link
          to={
            tenantKey && companyKey
              ? companyRoutes.dashboard(tenantKey, companyKey)
              : tenantBase || ERP_PATHS.tenantSelect
          }
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5"
          onClick={() => isMobile && setOpenMobile(false)}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            <LayoutDashboard className="size-4" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-[10px] font-bold tracking-[0.18em] text-sidebar-primary uppercase">
              Workforce
            </span>
            <span className="truncate text-sm font-semibold text-sidebar-foreground">
              ERP Portal
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />
      <SidebarContent className="px-1">
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePath(pathname, item.path);
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        render={<Link to={item.path} />}
                        isActive={isActive}
                        tooltip={item.label}
                        className="rounded-lg"
                        onClick={() => isMobile && setOpenMobile(false)}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />
      <SidebarFooter className="p-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:px-0">
          <Avatar size="sm">
            <AvatarFallback className="bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
              {(user?.displayName ?? user?.name ?? user?.email ?? "U")[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2">
              <span className="truncate text-xs font-semibold text-sidebar-foreground">
                {user?.displayName ?? user?.name ?? "User"}
              </span>
              {user?.role ? <Badge variant="outline">{user.role}</Badge> : null}
            </div>
            <span className="truncate text-[10px] text-sidebar-foreground/70">
              {user?.email ?? ""}
            </span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
