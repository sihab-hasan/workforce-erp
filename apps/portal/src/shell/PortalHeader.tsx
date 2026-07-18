import { Bell, Search, Settings, Menu } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
} from "@workforce-erp/ui/components/avatar"
import { Button } from "@workforce-erp/ui/components/button"
import { Separator } from "@workforce-erp/ui/components/separator"
import { SidebarTrigger } from "@workforce-erp/ui/components/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workforce-erp/ui/components/tooltip"
import { appConfig } from "@/app/config/app.config.ts"
import { BranchSwitcher } from "@/shell/BranchSwitcher.tsx"
import { Breadcrumbs } from "@/shell/Breadcrumbs.tsx"
import { CommandMenu } from "@/shell/CommandMenu.tsx"
import { TenantSwitcher } from "@/shell/TenantSwitcher.tsx"

type PortalHeaderProps = {
  section: string
  title: string
}

export function PortalHeader({ section, title }: PortalHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 px-3 py-2 md:gap-3 md:px-4 md:py-2.5">

        {/* Left — sidebar trigger + page identity */}
        <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
          <SidebarTrigger className="shrink-0 text-muted-foreground hover:text-foreground" />
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <div className="min-w-0">
            <Breadcrumbs section={section} title={title} />
            <h1 className="mt-0.5 truncate text-sm font-bold text-foreground md:text-base">
              {title}
            </h1>
          </div>
        </div>

        {/* Center — search (hidden on small screens) */}
        <div className="hidden max-w-sm flex-1 lg:block">
          <CommandMenu hint={appConfig.commandHint} />
        </div>

        {/* Right — actions + avatar */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Tenant + Branch — hidden on mobile */}
          <div className="hidden items-center gap-1 sm:flex">
            <TenantSwitcher tenantName="Acme Manufacturing" />
            <BranchSwitcher branchName="team-lead/work" />
            <Separator orientation="vertical" className="mx-1 h-5" />
          </div>

          {/* Search icon — visible on mobile instead of command menu */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Search"
                className="text-muted-foreground"
              >
                <Search className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search</TooltipContent>
          </Tooltip>

          {/* Notifications */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Notifications"
                  className="text-muted-foreground"
                >
                  <Bell className="size-4" />
                </Button>
                <span className="absolute top-1.5 right-1.5 flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          {/* Settings — hidden on mobile */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Settings"
                className="hidden text-muted-foreground sm:inline-flex"
              >
                <Settings className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-1 h-5" />

          {/* Avatar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="User menu"
                className="rounded-full ring-2 ring-primary/40 transition-all hover:ring-primary"
              >
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
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
