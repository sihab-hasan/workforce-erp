import { Check } from "lucide-react"
import { Link } from "react-router-dom"

import { siteRoutes } from "@/app/config/site-map"
import { Section } from "@/shell/section"
import { buttonVariants } from "@workforce-erp/ui/components/button"
import { cn } from "@workforce-erp/ui/lib/utils"

export interface CallToActionSectionProps {
  className?: string
}

export function CallToActionSection({ className }: CallToActionSectionProps) {
  return (
    <Section
      className={cn(
        "relative overflow-hidden bg-primary py-20 text-primary-foreground md:py-24 lg:py-28",
        className
      )}
      containerClassName="relative"
    >
      <ConnectedLines className="-top-20 -right-24 rotate-180" />
      <ConnectedLines className="-bottom-20 -left-24" />

      <div className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:gap-20">
        <div className="max-w-3xl">
          <h2 className="font-heading text-4xl leading-[1.08] font-bold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl">
            Bring your people, payroll, and operations into one clear system.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-primary-foreground/75 sm:text-lg sm:leading-8">
            See how Workforce ERP can replace scattered workflows with one
            connected way to run your business.
          </p>
        </div>

        <div className="flex flex-col items-start gap-7">
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link
              to={siteRoutes.demoRequest.path}
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "h-12 w-full px-6 text-base sm:w-auto lg:w-full xl:w-auto"
              )}
            >
              Request a demo
            </Link>
            <Link
              to={siteRoutes.features.path}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 w-full border-primary-foreground/45 bg-transparent px-6 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto lg:w-full xl:w-auto"
              )}
            >
              Explore the platform
            </Link>
          </div>

          <p className="flex items-center gap-3 text-sm leading-6 text-primary-foreground/75 sm:text-base">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary-foreground/55">
              <Check aria-hidden="true" />
            </span>
            A focused walkthrough, tailored to your team.
          </p>
        </div>
      </div>
    </Section>
  )
}

function ConnectedLines({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute h-52 w-96 text-primary-foreground/25 md:h-64 md:w-[32rem]",
        className
      )}
      viewBox="0 0 520 260"
      fill="none"
    >
      <path
        d="M-18 34C80 41 92 134 194 134C301 134 330 49 538 93"
        stroke="currentColor"
      />
      <path
        d="M-8 79C83 83 93 181 213 181C341 181 349 96 535 131"
        stroke="currentColor"
      />
      <path
        d="M-20 123C59 127 104 218 229 218C353 218 388 148 542 169"
        stroke="currentColor"
      />
      <circle cx="92" cy="109" r="6" fill="currentColor" />
      <circle cx="194" cy="134" r="4" fill="currentColor" />
      <circle cx="330" cy="73" r="7" fill="currentColor" />
      <circle cx="402" cy="163" r="5" fill="currentColor" />
    </svg>
  )
}
