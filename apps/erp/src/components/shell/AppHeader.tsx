import { Bell, LogOut, Moon, Sun } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { Separator } from "@workforce-erp/ui/components/separator";
import { SidebarTrigger } from "@workforce-erp/ui/components/sidebar";
import { Avatar, AvatarFallback } from "@workforce-erp/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workforce-erp/ui/components/dropdown-menu";
import { useTheme } from "@workforce-erp/ui/hooks/use-theme";
import { useAuth } from "@workforce-erp/auth";
import { AppBreadcrumbs } from "#components/shell/AppBreadcrumbs";
import { ERP_PATHS, companyRoutes, tenantRoutes } from "#routes/paths";

const TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  departments: "Departments",
  employees: "Employees",
  leave: "Leave",
  timesheets: "Timesheets",
  approvals: "Approvals",
  documents: "Documents",
  reports: "Reports",
  notifications: "Notifications",
  organization: "Organization",
  companies: "Companies",
  users: "Users",
  roles: "Roles & permissions",
  settings: "Settings",
  new: "Create",
  edit: "Edit",
  history: "History",
  upload: "Upload",
};

function titleFromPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const last = parts.at(-1) ?? "dashboard";
  if (TITLES[last]) return TITLES[last];
  const previous = parts.at(-2);
  if (previous && TITLES[previous]) return `${TITLES[previous]} details`;
  return "Workforce ERP";
}

export function AppHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { tenantKey, companyKey } = useParams();
  const { session } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const user = session?.user;
  const title = titleFromPath(pathname);
  const section = companyKey ? "Company" : "Organization";
  const isDark = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
          <SidebarTrigger className="shrink-0 rounded-lg text-muted-foreground hover:text-foreground" />
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <div className="min-w-0">
            <AppBreadcrumbs section={section} title={title} />
            <h1 className="mt-0.5 truncate text-sm font-bold text-foreground md:text-base">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={isDark ? "Use light theme" : "Use dark theme"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Notifications"
            onClick={() =>
              tenantKey &&
              companyKey &&
              navigate(companyRoutes.notifications(tenantKey, companyKey))
            }
          >
            <Bell aria-hidden="true" />
          </Button>
          <Separator orientation="vertical" className="mx-1 h-5" />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  aria-label="User menu"
                  className="rounded-full outline-none ring-2 ring-border transition hover:ring-primary"
                />
              }
            >
              <Avatar size="sm">
                <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                  {(user?.displayName ?? user?.name ?? user?.email ?? "U")[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold">
                      {user?.displayName ?? user?.name ?? "User"}
                    </span>
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {user?.email ?? ""}
                    </span>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {tenantKey ? (
                <>
                  <DropdownMenuItem
                    onClick={() => tenantKey && navigate(tenantRoutes.profileSettings(tenantKey))}
                  >
                    My profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => tenantKey && navigate(tenantRoutes.securitySettings(tenantKey))}
                  >
                    Account security
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => tenantKey && navigate(tenantRoutes.sessionSettings(tenantKey))}
                  >
                    Active sessions
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              ) : null}
              {tenantKey && companyKey ? (
                <DropdownMenuItem onClick={() => navigate(tenantRoutes.switchCompany(tenantKey))}>
                  Switch company
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onClick={() => navigate(ERP_PATHS.tenantSelect)}>
                Switch tenant
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(ERP_PATHS.signOut)}>
                <LogOut className="mr-2 size-4" aria-hidden="true" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
