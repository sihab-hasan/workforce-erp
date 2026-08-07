import { CircleCheck } from "lucide-react"
import { useRef } from "react"
import { Link } from "react-router-dom"

import {
  bindScrollAnimation,
  gsap,
  prefersReducedMotion,
  useGSAP,
} from "@workforce-erp/ui/motion"

import { footerNavigationGroups, siteRoutes } from "@/app/config/site-map"
import { Container } from "./container"

export default function SiteFooter() {
  const footerRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const animatedElements = [
        "[data-footer-brand]",
        "[data-footer-group]",
        "[data-footer-meta]",
        "[data-footer-path]",
        "[data-footer-node]",
      ]

      if (prefersReducedMotion()) {
        gsap.set(animatedElements, { clearProps: "all" })
        return
      }

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        paused: true,
      })

      const paths = gsap.utils.toArray<SVGPathElement>("[data-footer-path]")

      paths.forEach((path, index) => {
        const pathLength = path.getTotalLength()

        timeline.fromTo(
          path,
          {
            strokeDasharray: pathLength,
            strokeDashoffset: pathLength,
          },
          {
            duration: 1.15,
            ease: "power2.inOut",
            strokeDashoffset: 0,
          },
          index * 0.08
        )
      })

      timeline
        .from(
          "[data-footer-brand]",
          { autoAlpha: 0, duration: 0.82, y: 34 },
          0.16
        )
        .from(
          "[data-footer-group]",
          { autoAlpha: 0, duration: 0.62, stagger: 0.1, x: 26 },
          0.42
        )
        .from(
          "[data-footer-meta]",
          { autoAlpha: 0, duration: 0.62, y: 16 },
          0.6
        )
        .from(
          "[data-footer-node]",
          {
            duration: 0.4,
            ease: "back.out(2)",
            scale: 0,
            stagger: 0.06,
            transformOrigin: "center",
          },
          0.72
        )

      if (footerRef.current) {
        bindScrollAnimation(timeline, {
          start: "top 82%",
          toggleActions: "play none play reverse",
          trigger: footerRef.current,
        })
      }
    },
    { scope: footerRef }
  )

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden bg-primary text-primary-foreground"
    >
      <FooterConnectedLines className="-top-16 -right-24 rotate-180" />
      <FooterConnectedLines className="-bottom-20 -left-24" />

      <Container className="relative py-12 sm:py-16">
        <div className="grid gap-12 border-b border-primary-foreground/20 pb-12 lg:grid-cols-[minmax(14rem,1.25fr)_minmax(0,3fr)] lg:gap-16 lg:pb-16">
          <div data-footer-brand className="max-w-xs">
            <Link
              to={siteRoutes.home.path}
              aria-label="Workforce ERP home"
              className="group inline-flex items-center gap-3 rounded-sm text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:outline-none"
            >
              <span className="relative block h-6 w-8" aria-hidden="true">
                <span className="absolute top-2 left-0 h-0.5 w-7 origin-left bg-primary-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-x-110" />
                <span className="absolute top-3.5 left-1 h-0.5 w-5 origin-left bg-primary-foreground transition-transform delay-75 duration-300 group-hover:scale-x-125" />
                <span className="absolute top-0 left-3 h-3.5 w-0.5 origin-bottom bg-primary-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-y-110" />
              </span>
              <span className="text-lg font-semibold tracking-[-0.035em]">
                Workforce ERP
              </span>
            </Link>
            <p className="mt-5 text-sm leading-6 text-primary-foreground/70">
              One connected platform for planning, people operations,
              automation, analytics, and service delivery.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4"
          >
            {footerNavigationGroups.map((group) => (
              <section key={group.heading} data-footer-group>
                <h2 className="text-xs font-semibold tracking-[0.14em] text-primary-foreground uppercase">
                  {group.heading}
                </h2>
                <ul className="mt-5 grid gap-3">
                  {group.items.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="group/link relative inline-flex rounded-sm text-sm text-primary-foreground/70 transition-colors duration-300 hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:outline-none"
                      >
                        {item.label}
                        <span
                          aria-hidden="true"
                          className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-primary-foreground transition-transform duration-300 ease-out group-hover/link:scale-x-100"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>

        <div
          data-footer-meta
          className="flex flex-col gap-4 pt-6 text-xs text-primary-foreground/70 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            © {new Date().getFullYear()} Workforce ERP. All rights reserved.
          </p>
          <Link
            to={siteRoutes.status.path}
            className="inline-flex w-fit items-center gap-2 rounded-sm transition-colors hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:outline-none"
          >
            <span className="relative flex size-3.5 items-center justify-center">
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-emerald-500/25 motion-safe:animate-ping"
              />
              <CircleCheck
                aria-hidden="true"
                className="relative size-3.5 text-emerald-500"
              />
            </span>
            System status
          </Link>
        </div>
      </Container>
    </footer>
  )
}

function FooterConnectedLines({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute h-52 w-96 text-primary-foreground/20 md:h-64 md:w-[32rem] ${className ?? ""}`}
      viewBox="0 0 520 260"
      fill="none"
    >
      <path
        data-footer-path
        d="M-18 34C80 41 92 134 194 134C301 134 330 49 538 93"
        stroke="currentColor"
      />
      <path
        data-footer-path
        d="M-8 79C83 83 93 181 213 181C341 181 349 96 535 131"
        stroke="currentColor"
      />
      <path
        data-footer-path
        d="M-20 123C59 127 104 218 229 218C353 218 388 148 542 169"
        stroke="currentColor"
      />
      <circle data-footer-node cx="92" cy="109" r="6" fill="currentColor" />
      <circle data-footer-node cx="194" cy="134" r="4" fill="currentColor" />
      <circle data-footer-node cx="330" cy="73" r="7" fill="currentColor" />
      <circle data-footer-node cx="402" cy="163" r="5" fill="currentColor" />
    </svg>
  )
}
