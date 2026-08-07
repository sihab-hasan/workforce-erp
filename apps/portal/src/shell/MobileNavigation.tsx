import { Link } from "react-router-dom"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@workforce-erp/ui/components/dropdown-menu"
import { cn } from "@workforce-erp/ui/lib/utils"
import type { PortalRoute } from "@/app/config/routes.config.ts"

type MobileNavigationProps = {
  currentPath: string
  routes: PortalRoute[]
}

function isRouteActive(route: PortalRoute, currentPath: string) {
  if (route.path === "/") return currentPath === "/"
  return currentPath === route.path || currentPath.startsWith(`${route.path}/`)
}

export function MobileNavigation({
  currentPath,
  routes,
}: MobileNavigationProps) {
  const primaryRoutes = routes.slice(0, 4)
  const overflowRoutes = routes.slice(4)
  const isOverflowActive = overflowRoutes.some((route) =>
    isRouteActive(route, currentPath)
  )

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-background/85 md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-5 gap-1">
        {primaryRoutes.map((route) => {
          const Icon = route.icon
          const isActive = isRouteActive(route, currentPath)

          return (
            <Link
              key={route.key}
              to={route.path}
              className={cn(
                "flex min-w-0 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-center transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg transition-colors",
                  isActive ? "bg-background text-primary shadow-sm" : ""
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <span
                className={cn(
                  "w-full truncate text-[9px] leading-tight font-semibold",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {route.title}
              </span>
            </Link>
          )
        })}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className={cn(
                  "flex min-w-0 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-center transition-colors",
                  isOverflowActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              />
            }
          >
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-lg transition-colors",
                isOverflowActive ? "bg-background text-primary shadow-sm" : ""
              )}
            >
              <MoreHorizontal className="size-4" aria-hidden />
            </span>
            <span
              className={cn(
                "w-full truncate text-[9px] leading-tight font-semibold",
                isOverflowActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              More
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            sideOffset={10}
            className="w-64"
          >
            <DropdownMenuLabel>More destinations</DropdownMenuLabel>
            <DropdownMenuGroup>
              {overflowRoutes.map((route) => {
                const Icon = route.icon
                const isActive = isRouteActive(route, currentPath)

                return (
                  <DropdownMenuItem
                    key={route.key}
                    render={<Link to={route.path} />}
                    className={cn(
                      isActive ? "bg-accent text-accent-foreground" : ""
                    )}
                  >
                    <Icon aria-hidden />
                    <span className="truncate">{route.title}</span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
