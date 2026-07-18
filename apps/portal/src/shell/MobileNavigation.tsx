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
  // Show only primary 5 routes on mobile
  const primaryRoutes = routes.slice(0, 5)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-2 py-1 backdrop-blur-md md:hidden">
      <div className="grid grid-cols-5 gap-0.5">
        {primaryRoutes.map((route) => {
          const Icon = route.icon
          const isActive = route.path === currentPath

          return (
            <Link
              key={route.key}
              to={route.path}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-center transition-all duration-150 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span
                className={`flex size-8 items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? "bg-primary/15 text-primary shadow-sm shadow-primary/20"
                    : ""
                }`}
              >
                <Icon className="size-4" />
              </span>
              <span
                className={`text-[9px] leading-tight font-semibold ${
                  isActive ? "text-primary" : "text-muted-foreground"
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
