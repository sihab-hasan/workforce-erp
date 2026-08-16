import { ArrowUpRight, ChevronRight, Menu, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, NavLink } from "react-router-dom"

import { cn } from "@workforce-erp/ui/lib/utils"
import { Button } from "@workforce-erp/ui/components/button"

import { portalLinks } from "@/app/config/external-links"
import {
  mobileNavigationGroups,
  mobilePrimaryNavigationItems,
  siteRoutes,
} from "@/app/config/site-map"

const mobileMenuLinkClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    "group flex min-h-12 items-center justify-between gap-4 rounded-md px-4 py-3 text-[0.9375rem] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-foreground hover:bg-muted"
  )

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const desktopQuery = window.matchMedia("(min-width: 1280px)")
    const handleDesktopChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("pointerdown", handlePointerDown)
    desktopQuery.addEventListener("change", handleDesktopChange)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("pointerdown", handlePointerDown)
      desktopQuery.removeEventListener("change", handleDesktopChange)
    }
  }, [isOpen])

  return (
    <div ref={menuRef} className="xl:hidden">
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon-lg"
        className={cn(
          "relative rounded-md border border-transparent transition-colors",
          isOpen && "border-border bg-muted"
        )}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? (
          <X aria-hidden="true" className="size-4" />
        ) : (
          <Menu aria-hidden="true" className="size-4" />
        )}
      </Button>

      {isOpen ? (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-full h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain border-t border-border/70 bg-background shadow-[0_24px_70px_-24px_rgba(0,0,0,0.35)]"
        >
          <div className="mx-auto flex min-h-full max-w-7xl flex-col px-5 pt-6 pb-5 sm:px-8 sm:pt-8">
            <p className="mb-4 font-heading text-2xl font-semibold tracking-[-0.04em]">
              Where do you want to go?
            </p>

            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {mobilePrimaryNavigationItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={mobileMenuLinkClassName}
                    onClick={() => setIsOpen(false)}
                  >
                    <span>{item.label}</span>
                    <ChevronRight
                      aria-hidden="true"
                      className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                    />
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-8 grid gap-x-10 gap-y-7 border-t border-border/70 pt-7 sm:grid-cols-3">
              {mobileNavigationGroups.map((group) => (
                <section
                  key={group.heading}
                  aria-labelledby={`mobile-${group.heading}`}
                >
                  <h2
                    id={`mobile-${group.heading}`}
                    className="mb-2 px-3 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase"
                  >
                    {group.heading}
                  </h2>
                  <ul className="grid gap-0.5">
                    {group.items.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.end}
                          className={({ isActive }) =>
                            cn(
                              "group flex min-h-11 items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-muted"
                            )
                          }
                          onClick={() => setIsOpen(false)}
                        >
                          {item.label}
                          <ArrowUpRight
                            aria-hidden="true"
                            className="size-3.5 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                          />
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <div className="mt-auto grid gap-3 border-t border-border/70 pt-5 sm:grid-cols-2">
              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                className="h-11 w-full"
                render={
                  <a
                    href={portalLinks.login}
                    onClick={() => setIsOpen(false)}
                  />
                }
              >
                Sign In
              </Button>
              <Button
                size="lg"
                nativeButton={false}
                className="h-11 w-full"
                render={
                  <Link
                    to={siteRoutes.demoRequest.path}
                    onClick={() => setIsOpen(false)}
                  />
                }
              >
                {siteRoutes.demoRequest.label}
              </Button>
            </div>
          </div>
        </nav>
      ) : null}
    </div>
  )
}
