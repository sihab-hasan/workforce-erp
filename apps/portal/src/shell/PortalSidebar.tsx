import { Link } from "react-router-dom"

import type { PortalRoute } from "@/app/config/routes.config.ts"

type PortalSidebarProps = {
  currentPath: string
  routes: PortalRoute[]
}

export function PortalSidebar({ currentPath, routes }: PortalSidebarProps) {
  const sections = routes.reduce<Record<string, PortalRoute[]>>(
    (acc, route) => {
      const currentSection = acc[route.section] ?? []
      currentSection.push(route)
      acc[route.section] = currentSection
      return acc
    },
    {}
  )

  return (
    <aside className="flex h-screen w-80 shrink-0 flex-col border-r border-slate-200 bg-slate-50/50 backdrop-blur lg:flex dark:border-slate-800 dark:bg-slate-950/50">
      <div className="p-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-lg shadow-indigo-500/20">
          <div className="relative z-10">
            <p className="text-[10px] font-bold tracking-[0.2em] text-indigo-100 uppercase">
              Workforce ERP
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">Portal</h2>
          </div>
          <div className="absolute -top-4 -right-4 size-20 rounded-full bg-white/10 blur-2xl" />
        </div>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto px-4 pb-6">
        {Object.entries(sections).map(([section, sectionRoutes]) => (
          <div key={section} className="space-y-2">
            <p className="px-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
              {section}
            </p>
            <div className="space-y-1">
              {sectionRoutes.map((route) => {
                const Icon = route.icon
                const isActive = route.path === currentPath

                return (
                  <Link
                    key={route.key}
                    className={`group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-900"
                        : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                    }`}
                    to={route.path}
                  >
                    <Icon
                      className={`mt-0.5 size-4 shrink-0 transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`}
                    />
                    <span className="space-y-0.5">
                      <span className="block text-sm font-semibold">
                        {route.title}
                      </span>
                      <span className="block text-[11px] opacity-70">
                        {route.description}
                      </span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
