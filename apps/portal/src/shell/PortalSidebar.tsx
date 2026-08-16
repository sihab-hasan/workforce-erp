import { Link } from "react-router-dom"
import { LayoutDashboard } from "lucide-react"
import { Avatar, AvatarFallback } from "@workforce-erp/ui/components/avatar"
import { Badge } from "@workforce-erp/ui/components/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@workforce-erp/ui/components/sidebar"

import type { PortalRoute } from "@/app/config/routes.config.ts"
import { useAuth } from "@workforce-erp/auth-client"

type PortalSidebarProps = {
  currentPath: string
  routes: PortalRoute[]
}

export function PortalSidebar({ currentPath, routes }: PortalSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  const { session } = useAuth()
  const user = session?.user

  const sections = routes.reduce<Record<string, PortalRoute[]>>(
    (acc, route) => {
      const current = acc[route.section] ?? []
      current.push(route)
      acc[route.section] = current
      return acc
    },
    {}
  )

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="border-sidebar-border"
    >
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            <LayoutDashboard aria-hidden />
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-bold tracking-widest text-sidebar-primary uppercase">
              Workforce
            </span>
            <span className="truncate text-sm leading-none font-semibold text-sidebar-foreground">
              ERP Portal
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-1">
        {Object.entries(sections).map(([section, sectionRoutes]) => (
          <SidebarGroup key={section}>
            <SidebarGroupLabel>{section}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sectionRoutes.map((route) => {
                  const Icon = route.icon
                  const isActive = route.path === currentPath
                  return (
                    <SidebarMenuItem key={route.key}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={route.title}
                        className="rounded-lg"
                        render={
                          <Link
                            to={route.path}
                            onClick={() => {
                              if (isMobile) setOpenMobile(false)
                            }}
                          />
                        }
                      >
                        <Icon />
                        <span>{route.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
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
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2">
              <span className="truncate text-xs font-semibold text-sidebar-foreground">
                {user?.name ?? "Authenticated user"}
              </span>
              <Badge variant="outline">{user?.role ?? "—"}</Badge>
            </div>
            <span className="truncate text-[10px] text-sidebar-foreground/70">
              {user?.email ?? ""}
            </span>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
