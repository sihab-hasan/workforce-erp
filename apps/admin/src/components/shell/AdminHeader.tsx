import { LogOut, Moon, Sun } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { apiClient } from "#lib/api";
import { AdminBreadcrumbs } from "#components/shell/AdminBreadcrumbs";
import { ADMIN_PATHS } from "#routes/paths";

const labels: Record<string, string> = {
  dashboard: "Dashboard",
  tenants: "Tenants",
  organizations: "Organizations",
  users: "Users",
  roles: "Roles & capabilities",
  settings: "Settings",
  new: "Create",
  edit: "Edit",
  capabilities: "Capability matrix",
};

function getTitle(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const last = parts.at(-1) ?? "dashboard";
  if (labels[last]) return labels[last];
  const prev = parts.at(-2);
  return prev && labels[prev] ? `${labels[prev]} details` : "Platform Administration";
}

export function AdminHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { session, signOut } = useAuth();
  const user = session?.user;
  const title = getTitle(pathname);
  const isDark = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <div className="min-w-0">
            <AdminBreadcrumbs title={title} />
            <h1 className="mt-0.5 truncate text-sm font-bold md:text-base">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun /> : <Moon />}
          </Button>
          <Separator orientation="vertical" className="mx-1 h-5" />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  aria-label="Admin menu"
                  className="rounded-full outline-none ring-2 ring-border hover:ring-primary"
                />
              }
            >
              <Avatar size="sm">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {(user?.displayName ?? user?.name ?? user?.email ?? "A")[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <p className="truncate text-sm font-semibold">
                    {user?.displayName ?? user?.name ?? "Administrator"}
                  </p>
                  <p className="truncate text-xs font-normal text-muted-foreground">
                    {user?.email ?? ""}
                  </p>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await apiClient.logout();
                  } catch {
                    // Ignore network failure on sign out
                  }
                  signOut();
                  navigate(ADMIN_PATHS.signIn, { replace: true });
                }}
              >
                <LogOut className="mr-2 size-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
