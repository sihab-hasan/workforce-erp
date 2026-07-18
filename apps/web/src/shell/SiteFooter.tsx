import { ArrowUpRight, CircleCheck } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@workforce-erp/ui/components/button"

import { footerNavigationGroups, siteRoutes } from "@/app/config/site-map"
import { Container } from "./container"

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <Container className="py-14 sm:py-20">
        <div className="grid gap-10 border-b border-border pb-12 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:items-end lg:gap-16 lg:pb-16">
          <div className="max-w-2xl border-l-2 border-primary pl-6 sm:pl-8">
            <p className="text-3xl leading-[1.05] font-semibold tracking-[-0.045em] text-foreground sm:text-5xl">
              Clarity, speed, and
              <br />
              reliable operations.
            </p>
            <p className="mt-6 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Modern workforce operations for growing teams across planning,
              automation, analytics, and service delivery.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[22rem]">
            <Button
              size="lg"
              nativeButton={false}
              className="h-11 px-5 font-semibold"
              render={<Link to={siteRoutes.demoRequest.path} />}
            >
              {siteRoutes.demoRequest.label}
              <ArrowUpRight data-icon="inline-end" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              nativeButton={false}
              className="h-11 px-5"
              render={<Link to={siteRoutes.contact.path} />}
            >
              {siteRoutes.contact.label}
            </Button>
          </div>
        </div>

        <div className="grid gap-12 border-b border-border py-12 lg:grid-cols-[minmax(14rem,1.25fr)_minmax(0,3fr)] lg:gap-16 lg:py-16">
          <div className="max-w-xs">
            <Link
              to={siteRoutes.home.path}
              aria-label="Workforce ERP home"
              className="group inline-flex items-center gap-3 rounded-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              One connected platform for planning, people operations,
              automation, analytics, and service delivery.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4"
          >
            {footerNavigationGroups.map((group) => (
              <section key={group.heading}>
                <h2 className="text-xs font-semibold tracking-[0.14em] text-foreground uppercase">
                  {group.heading}
                </h2>
                <ul className="mt-5 grid gap-3">
                  {group.items.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="rounded-sm text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Workforce ERP. All rights reserved.
          </p>
          <Link
            to={siteRoutes.status.path}
            className="inline-flex w-fit items-center gap-2 rounded-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <CircleCheck
              aria-hidden="true"
              className="size-3.5 text-emerald-500"
            />
            System status
          </Link>
        </div>
      </Container>
    </footer>
  )
}
