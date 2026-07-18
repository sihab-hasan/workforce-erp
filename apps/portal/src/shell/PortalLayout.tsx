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

      <SidebarInset className="min-h-screen overflow-x-hidden bg-background">
        <PortalHeader
          section={currentRoute.section}
          title={currentRoute.title}
        />

        <main className="flex-1 px-4 py-5 md:px-6 md:py-7 lg:px-8">
          <div className="mx-auto w-full">{children}</div>
        </main>

        <MobileNavigation
          currentPath={location.pathname}
          routes={portalRoutes}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
