import { ArrowUpRight, ChevronDown } from "lucide-react"
import { useRef } from "react"
import { NavLink, useLocation } from "react-router-dom"

import { cn } from "@workforce-erp/ui/lib/utils"

import type { NavigationDropdownItem } from "./navigation.types"

type NavigationDropdownProps = {
  align?: "left" | "right"
  items: readonly NavigationDropdownItem[]
  label: string
}

export function NavigationDropdown({
  align = "left",
  items,
  label,
}: NavigationDropdownProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const { pathname } = useLocation()
  const isActive = items.some((item) => pathname.startsWith(item.to))

  return (
    <details
      ref={detailsRef}
      name="site-navigation"
      className="group relative"
      onMouseEnter={() => detailsRef.current?.setAttribute("open", "")}
      onMouseLeave={() => detailsRef.current?.removeAttribute("open")}
      onFocusCapture={() => detailsRef.current?.setAttribute("open", "")}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          detailsRef.current?.removeAttribute("open")
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          detailsRef.current?.removeAttribute("open")
          detailsRef.current?.querySelector("summary")?.focus()
        }
      }}
    >
      <summary
        className={cn(
          "relative inline-flex cursor-pointer list-none items-center gap-1.5 py-5 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:bottom-3 after:h-0.5 after:origin-center after:bg-primary after:transition-transform hover:text-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-details-marker]:hidden",
          isActive
            ? "text-foreground after:scale-x-100"
            : "text-muted-foreground after:scale-x-0 hover:after:scale-x-100"
        )}
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className="size-3.5 transition-transform duration-200 group-open:rotate-180"
        />
      </summary>

      <div
        className={cn(
          "absolute top-full z-50 w-[22rem] pt-3",
          align === "right" ? "right-0" : "left-0"
        )}
      >
        <div className="overflow-hidden rounded border border-border bg-background">
          <div className="flex items-end justify-between px-5 py-4">
            <div>
              <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-primary uppercase">
                Explore
              </p>
              <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-foreground">
                {label}
              </p>
            </div>
            <span className="h-px w-12 bg-primary" aria-hidden="true" />
          </div>

          <ul className="grid gap-px border-t p-px">
            {items.map((item) => (
              <li key={item.to} className="bg-background">
                <NavLink
                  to={item.to}
                  className={({ isActive: isItemActive }) =>
                    cn(
                      "group/item flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset",
                      isItemActive ? "bg-muted" : undefined
                    )
                  }
                  onClick={() => detailsRef.current?.removeAttribute("open")}
                >
                  {({ isActive: isItemActive }) => (
                    <>
                      <span className="min-w-0">
                        <span
                          className={cn(
                            "block text-sm font-semibold transition-colors group-hover/item:text-primary",
                            isItemActive ? "text-primary" : "text-foreground"
                          )}
                        >
                          {item.label}
                        </span>
                        {item.description ? (
                          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                            {item.description}
                          </span>
                        ) : null}
                      </span>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-all group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 group-hover/item:text-primary"
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  )
}
