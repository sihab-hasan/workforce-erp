import { Link } from "react-router-dom"

import { Section } from "@/shell/section"
import { buttonVariants } from "@workforce-erp/ui/components/button"
import { cn } from "@workforce-erp/ui/lib/utils"

interface CtaBannerProps {
  title: string
  subtitle?: string
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
  className?: string
}

export function CtaBanner({
  title,
  subtitle,
  primaryLabel = "Get in touch",
  primaryHref = "/contact",
  secondaryLabel = "View work",
  secondaryHref = "/projects",
  className,
}: CtaBannerProps) {
  return (
    <Section className={cn("py-12 md:py-16", className)}>
      <div className="overflow-hidden rounded-3xl border bg-card px-6 py-12 text-center shadow-sm md:px-12 md:py-16">
        <p className="text-sm font-medium tracking-[0.3em] text-primary uppercase">
          Let&apos;s build something
        </p>

        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          {title}
        </h2>

        {subtitle ? (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
            {subtitle}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to={primaryHref} className={cn(buttonVariants({ size: "lg" }))}>
            {primaryLabel}
          </Link>

          <Link
            to={secondaryHref}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </Section>
  )
}
