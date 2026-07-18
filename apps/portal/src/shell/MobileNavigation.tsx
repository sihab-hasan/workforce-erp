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
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/60 bg-white/95 px-4 py-2 backdrop-blur-md lg:hidden dark:border-slate-800/60 dark:bg-slate-950/95">
      <div className="grid grid-cols-4 gap-1">
        {primaryRoutes.map((route) => {
          const Icon = route.icon
          const isActive = route.path === currentPath

          return (
            <Link
              key={route.key}
              to={route.path}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-center transition-all duration-150 ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <span
                className={`flex size-8 items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/30"
                    : "text-slate-400"
                }`}
              >
                <Icon className="size-4" />
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400"
                }`}
              >
                {route.title}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
