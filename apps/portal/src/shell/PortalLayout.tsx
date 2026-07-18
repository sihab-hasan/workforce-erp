import type { ReactNode } from "react"
import { useLocation } from "react-router-dom"
import { portalRoutes } from "@/app/config/routes.config.ts"
import { PortalSidebar } from "@/shell/PortalSidebar.tsx"
import { PortalHeader } from "@/shell/PortalHeader.tsx"
import { MobileNavigation } from "@/shell/MobileNavigation.tsx"

type PortalLayoutProps = {
  children: ReactNode
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const location = useLocation()

  // Find current route to pass context to header
  const currentRoute = portalRoutes.find(
    (route) => route.path === location.pathname
  ) || { section: "System", title: "Portal" }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <PortalSidebar currentPath={location.pathname} routes={portalRoutes} />

      <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        <PortalHeader
          section={currentRoute.section}
          title={currentRoute.title}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>

        <MobileNavigation
          currentPath={location.pathname}
          routes={portalRoutes}
        />
      </div>
    </div>
  )
}
