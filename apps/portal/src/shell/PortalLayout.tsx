import type { ReactNode } from "react"
import { useLocation } from "react-router-dom"
import {
  SidebarInset,
  SidebarProvider,
} from "@workforce-erp/ui/components/sidebar"
import { portalRoutes } from "@/app/config/routes.config.ts"
import { PortalSidebar } from "@/shell/PortalSidebar.tsx"
import { PortalHeader } from "@/shell/PortalHeader.tsx"
import { MobileNavigation } from "@/shell/MobileNavigation.tsx"

type PortalLayoutProps = {
  children: ReactNode
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const location = useLocation()

  const currentRoute = portalRoutes.find(
    (route) => route.path === location.pathname
  ) || { section: "System", title: "Portal" }

  return (
    <SidebarProvider defaultOpen={true}>
      <PortalSidebar currentPath={location.pathname} routes={portalRoutes} />

      <SidebarInset className="min-h-screen overflow-x-hidden">
        <PortalHeader
          section={currentRoute.section}
          title={currentRoute.title}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>

        <MobileNavigation
          currentPath={location.pathname}
          routes={portalRoutes}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
