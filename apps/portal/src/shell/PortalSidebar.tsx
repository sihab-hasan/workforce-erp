import { Link } from "react-router-dom"
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
} from "@workforce-erp/ui/components/sidebar"

import type { PortalRoute } from "@/app/config/routes.config.ts"

type PortalSidebarProps = {
  currentPath: string
  routes: PortalRoute[]
}

export function PortalSidebar({ currentPath, routes }: PortalSidebarProps) {
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
    <Sidebar collapsible="icon" variant="sidebar">
      {/* ── Logo / Brand ───────────────────────────────────────── */}
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-2 py-1">
          {/* Green logo mark */}
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-4 text-primary-foreground"
              aria-hidden="true"
            >
              <path
                d="M4 6h16M4 12h10M4 18h7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-bold tracking-widest text-primary uppercase">
              Workforce
            </span>
            <span className="text-sm leading-none font-semibold text-foreground">
              ERP Portal
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ── Navigation ─────────────────────────────────────────── */}
      <SidebarContent>
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
                        render={<Link to={route.path} />}
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

      {/* ── Footer ─────────────────────────────────────────────── */}
      <SidebarSeparator />
      <SidebarFooter>
        <div className="flex items-center gap-2.5 px-2 py-1 group-data-[collapsible=icon]:justify-center">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            U
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-xs font-semibold text-foreground">
              Portal User
            </span>
            <span className="truncate text-[10px] text-muted-foreground">
              user@acme.com
            </span>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
