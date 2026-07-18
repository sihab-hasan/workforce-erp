import { Moon, Sun } from "lucide-react"
import { Link, NavLink } from "react-router-dom"

import { cn } from "@workforce-erp/ui/lib/utils"
import { Button } from "@workforce-erp/ui/components/button"
import { useTheme } from "@workforce-erp/ui/providers/theme-provider"

import { siteRoutes, siteNavigationItems } from "@/app/config/site-map"
import { NavigationDropdown } from "@/shared/components/navigation"
import { MobileMenu } from "./MobileMenu"

export default function SiteNavbar() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl">
      <div className="relative flex h-18 items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-3 rounded-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Workforce ERP home"
        >
          <span className="relative block h-6 w-8" aria-hidden="true">
            <span className="absolute top-2 left-0 h-0.5 w-7 bg-primary transition-transform group-hover:translate-x-1" />
            <span className="absolute top-3.5 left-1 h-0.5 w-5 bg-primary" />
            <span className="absolute top-0 left-3 h-3.5 w-0.5 bg-primary" />
          </span>
          <span className="text-lg font-semibold tracking-[-0.035em]">
            Workforce ERP
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden lg:px-10 xl:block"
        >
          <ul className="flex items-center gap-6">
            {siteNavigationItems.map((item, index) => (
              <li key={item.to}>
                {item.items?.length ? (
                  <NavigationDropdown
                    label={item.label}
                    items={item.items}
                    align={
                      index === siteNavigationItems.length - 1
                        ? "right"
                        : "left"
                    }
                  />
                ) : (
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "relative inline-flex py-5 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:bottom-3 after:h-0.5 after:origin-center after:bg-primary after:transition-transform focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        isActive
                          ? "text-foreground after:scale-x-100"
                          : "text-muted-foreground after:scale-x-0 hover:text-foreground hover:after:scale-x-100"
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={isDark ? "Use light theme" : "Use dark theme"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? (
              <Sun aria-hidden="true" className="size-4" />
            ) : (
              <Moon aria-hidden="true" className="size-4" />
            )}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            nativeButton={false}
            className="hidden px-4 xl:inline-flex"
            render={<a href="/portal/auth/login" />}
          >
            Sign In
          </Button>

          <Button
            size="lg"
            nativeButton={false}
            className="hidden px-5 font-semibold xl:inline-flex"
            render={<Link to={siteRoutes.demoRequest.path} />}
          >
            {siteRoutes.demoRequest.label}
          </Button>

          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
