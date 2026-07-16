import { cn } from "@workforce-erp/ui/lib/utils"

import { NavigationLink } from "./navigation-link"
import type { NavigationItem, NavigationOrientation } from "./navigation.types"

type NavigationLinksProps = {
  ariaLabel: string
  className?: string
  items: readonly NavigationItem[]
  onNavigate?: () => void
  orientation?: NavigationOrientation
}

export function NavigationLinks({
  ariaLabel,
  className,
  items,
  onNavigate,
  orientation = "horizontal",
}: NavigationLinksProps) {
  return (
    <nav aria-label={ariaLabel} className={className}>
      <ul
        className={cn(
          "flex gap-1",
          orientation === "vertical" ? "flex-col" : "items-center"
        )}
      >
        {items.map((item) => (
          <li key={item.to}>
            <NavigationLink
              to={item.to}
              end={item.end ?? item.to === "/"}
              onClick={onNavigate}
            >
              {item.label}
            </NavigationLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
