import { Link } from "react-router-dom"

import type { PortalRoute } from "@/app/config/routes.config.ts"

type MobileNavigationProps = {
  currentPath: string
  routes: PortalRoute[]
}

export function MobileNavigation({
  currentPath,
  routes,
}: MobileNavigationProps) {
  const primaryRoutes = routes.slice(0, 4)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/95">
      <div className="grid grid-cols-4 gap-2">
        {primaryRoutes.map((route) => {
          const Icon = route.icon
          const isActive = route.path === currentPath

          return (
            <Link
              key={route.key}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-center text-xs font-medium ${
                isActive
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "text-slate-500 dark:text-slate-400"
              }`}
              to={route.path}
            >
              <Icon className="size-4" />
              <span>{route.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
