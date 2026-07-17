import type { ReactNode } from "react"
import { Building2 } from "lucide-react"

import { cn } from "@workforce-erp/ui/lib/utils"

interface AuthCardProps {
  /** Icon rendered inside the brand badge. Defaults to Building2. */
  icon?: ReactNode
  heading: string
  subheading: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

/**
 * Shared full-page auth card shell used by every authentication screen.
 * Provides consistent centering, brand mark, heading, card, and footer.
 */
export function AuthCard({
  icon,
  heading,
  subheading,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <main
      className={cn(
        "bg-background flex min-h-svh flex-col items-center justify-center px-4 py-12",
        className
      )}
    >
      {/* Card */}
      <div className="bg-card ring-border/60 w-full max-w-sm rounded-2xl px-8 py-10 ring-1 shadow-xl">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
            {icon ?? <Building2 className="size-6" />}
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-foreground text-xl font-semibold tracking-tight">
              {heading}
            </h1>
            <p className="text-muted-foreground text-sm">{subheading}</p>
          </div>
        </div>

        {/* Page-specific content */}
        {children}

        {/* Optional footer inside card */}
        {footer && (
          <div className="text-muted-foreground mt-6 text-center text-sm">
            {footer}
          </div>
        )}
      </div>

      {/* Legal line */}
      <p className="text-muted-foreground mt-6 text-center text-xs">
        © {new Date().getFullYear()} Workforce ERP. All rights reserved.
      </p>
    </main>
  )
}
