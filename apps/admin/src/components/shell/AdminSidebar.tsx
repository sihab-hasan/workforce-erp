import { Building2, LayoutDashboard, Settings, ShieldCheck, Users, Waypoints } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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
import { useAuth } from "@workforce-erp/auth";
import { ADMIN_PATHS } from "#routes/paths";

const items = [
  { label: "Dashboard", to: ADMIN_PATHS.dashboard, icon: LayoutDashboard },
  { label: "Tenants", to: ADMIN_PATHS.tenants, icon: Waypoints },
  { label: "Organizations", to: ADMIN_PATHS.organizations, icon: Building2 },
  { label: "Users", to: ADMIN_PATHS.users, icon: Users },
  { label: "Roles", to: ADMIN_PATHS.roles, icon: ShieldCheck },
  { label: "Settings", to: ADMIN_PATHS.settings, icon: Settings },
];

export function AdminSidebar() {
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const { session } = useAuth();
  const user = session?.user;

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="p-3">
        <Link
          to={ADMIN_PATHS.dashboard}
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            <ShieldCheck className="size-4" />
          </span>
          <span className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-[10px] font-bold tracking-[0.18em] text-sidebar-primary uppercase">
              Workforce
            </span>
            <span className="truncate text-sm font-semibold">Platform Admin</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="px-1">
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      render={<Link to={item.to} />}
                      isActive={isActive}
                      tooltip={item.label}
                      onClick={() => isMobile && setOpenMobile(false)}
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-3">
        <div className="flex items-center gap-2.5 rounded-lg border bg-sidebar-accent/40 px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:px-0">
          <Avatar size="sm">
            <AvatarFallback className="bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
              {(user?.displayName ?? user?.name ?? user?.email ?? "A")[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-semibold">
              {user?.displayName ?? user?.name ?? "Administrator"}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">{user?.email ?? ""}</p>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
