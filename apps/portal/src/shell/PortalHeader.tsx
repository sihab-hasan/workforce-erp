import {
  Bell,
  KeyRound,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@workforce-erp/ui/components/avatar"
import { Badge } from "@workforce-erp/ui/components/badge"
import { Button } from "@workforce-erp/ui/components/button"
import { Separator } from "@workforce-erp/ui/components/separator"
import { SidebarTrigger } from "@workforce-erp/ui/components/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workforce-erp/ui/components/tooltip"
import { appConfig } from "@/app/config/app.config.ts"
import { Breadcrumbs } from "@/shell/Breadcrumbs.tsx"
import { CommandMenu } from "@/shell/CommandMenu.tsx"
import { TenantSwitcher } from "@/shell/TenantSwitcher.tsx"
import { ThemeSwitcher } from "@/shell/ThemeSwitcher.tsx"
import { useAuth } from "@workforce-erp/auth-client"
import { useNavigate } from "react-router-dom"
import { authenticationApi } from "@/modules/core/authentication/api/authentication.api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workforce-erp/ui/components/dropdown-menu"

type PortalHeaderProps = {
  section: string
  title: string
}

export function PortalHeader({ section, title }: PortalHeaderProps) {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const user = session?.user

  async function handleLogout() {
    try {
      await authenticationApi.logout()
    } catch (err) {
      console.error("Logout request failed:", err)
    } finally {
      signOut()
      navigate("/auth/login")
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
          <SidebarTrigger className="shrink-0 rounded-lg text-muted-foreground hover:text-foreground" />
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <div className="min-w-0">
            <Breadcrumbs section={section} title={title} />
            <h1 className="mt-0.5 truncate text-sm font-bold text-foreground md:text-base">
              {title}
            </h1>
          </div>
        </div>

        <div className="hidden max-w-sm flex-1 lg:block">
          <CommandMenu hint={appConfig.commandHint} />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <div className="hidden items-center gap-1 sm:flex">
            <TenantSwitcher
              tenantName={user?.organizationName ?? "Workforce ERP"}
            />
            <Separator orientation="vertical" className="mx-1 h-5" />
          </div>

          <Tooltip>
            <TooltipTrigger
              render={<ThemeSwitcher className="text-muted-foreground" />}
            />
            <TooltipContent>Theme</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Search"
                  className="text-muted-foreground lg:hidden"
                >
                  <Search />
                </Button>
              }
            />
            <TooltipContent>Search</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger render={<div className="relative" />}>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Notifications"
                className="text-muted-foreground"
              >
                <Bell />
              </Button>
              <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px]">
                3
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Account security"
                  className="hidden text-muted-foreground sm:inline-flex"
                  onClick={() => navigate("/profile/security")}
                >
                  <Settings />
                </Button>
              }
            />
            <TooltipContent>Account security</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  id="user-menu-trigger"
                  aria-label="User menu"
                  className="rounded-full ring-2 ring-border transition-all outline-none hover:ring-primary"
                />
              }
            >
              <Avatar size="sm">
                <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-0.5">
                    <p className="truncate text-sm font-semibold">
                      {user?.name ?? "Authenticated user"}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {user?.email ?? ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate("/profile/security")}
                className="cursor-pointer"
              >
                <KeyRound className="mr-2 h-4 w-4" />
                <span>Account security</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate("/profile/sessions")}
                className="cursor-pointer"
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Sessions</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                id="logout-button"
                onClick={handleLogout}
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
