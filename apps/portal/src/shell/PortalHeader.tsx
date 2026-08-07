import { Bell, Search, Settings } from "lucide-react"
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

type PortalHeaderProps = {
  section: string
  title: string
}

export function PortalHeader({ section, title }: PortalHeaderProps) {
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
            <TenantSwitcher tenantName="Acme Manufacturing" />
            <Separator orientation="vertical" className="mx-1 h-5" />
          </div>

          <Tooltip>
            <TooltipTrigger>
              <ThemeSwitcher className="text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>Theme</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Search"
                className="text-muted-foreground lg:hidden"
              >
                <Search />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <div className="relative">
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
              </div>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Settings"
                className="hidden text-muted-foreground sm:inline-flex"
              >
                <Settings />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <Tooltip>
            <TooltipTrigger>
              <button
                type="button"
                aria-label="User menu"
                className="rounded-full ring-2 ring-border transition-all hover:ring-primary"
              >
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                    U
                  </AvatarFallback>
                </Avatar>
              </button>
            </TooltipTrigger>
            <TooltipContent>Profile</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  )
}
