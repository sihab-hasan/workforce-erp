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
    <aside className="hidden w-80 shrink-0 border-r border-slate-200 bg-white/70 px-4 py-6 backdrop-blur lg:block dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mb-6 px-3">
        <p className="text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
          Workforce ERP
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
          Portal
        </h2>
      </div>
      <nav className="space-y-6">
        {Object.entries(sections).map(([section, sectionRoutes]) => (
          <div key={section} className="space-y-2">
            <p className="px-3 text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
              {section}
            </p>
            <div className="space-y-1">
              {sectionRoutes.map((route) => {
                const Icon = route.icon
                const isActive = route.path === currentPath

                return (
                  <a
                    key={route.key}
                    className={`flex items-start gap-3 rounded-2xl px-3 py-3 transition ${
                      isActive
                        ? "bg-slate-950 text-white shadow-lg dark:bg-white dark:text-slate-950"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                    }`}
                    href={`#${route.path}`}
                  >
                    <Icon className="mt-0.5 size-4 shrink-0" />
                    <span className="space-y-1">
                      <span className="block text-sm font-semibold">
                        {route.title}
                      </span>
                      <span
                        className={`block text-xs ${
                          isActive
                            ? "text-white/70 dark:text-slate-700"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {route.description}
                      </span>
                    </span>
                  </a>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
