import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Search,
  Users,
} from "lucide-react"
import { useRef } from "react"
import { Link } from "react-router-dom"

import { siteRoutes } from "@/app/config/site-map"
import { Container } from "@/shell/container"
import { buttonVariants } from "@workforce-erp/ui/components/button"
import { cn } from "@workforce-erp/ui/lib/utils"
import {
  bindScrollAnimation,
  gsap,
  prefersReducedMotion,
  useGSAP,
} from "@workforce-erp/ui/motion"

export interface HeroSectionProps {
  className?: string
}

const employees = [
  {
    initials: "AP",
    name: "Ava Patel",
    role: "Product manager",
    tone: "bg-amber-100 text-amber-900",
  },
  {
    initials: "EB",
    name: "Ethan Brooks",
    role: "Senior developer",
    tone: "bg-sky-100 text-sky-900",
  },
  {
    initials: "MG",
    name: "Maria Gomez",
    role: "HR generalist",
    tone: "bg-rose-100 text-rose-900",
  },
  {
    initials: "LC",
    name: "Liam Chen",
    role: "Finance analyst",
    tone: "bg-violet-100 text-violet-900",
  },
]

const attendance = [
  { name: "Ava Patel", status: "Present", time: "9:02 AM", hours: "8h 56m" },
  { name: "Ethan Brooks", status: "Present", time: "9:01 AM", hours: "9h 00m" },
  { name: "Maria Gomez", status: "On leave", time: "—", hours: "—" },
  { name: "Liam Chen", status: "Present", time: "8:55 AM", hours: "8h 45m" },
]

export function HeroSection({ className }: HeroSectionProps) {
  const heroRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set(
          [
            "[data-hero-title]",
            "[data-hero-copy]",
            "[data-hero-preview]",
            "[data-hero-panel]",
            "[data-hero-path]",
            "[data-hero-node]",
          ],
          { clearProps: "all" }
        )
        return
      }

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        paused: true,
      })

      timeline
        .from("[data-hero-title]", {
          autoAlpha: 0,
          duration: 1,
          filter: "blur(10px)",
          yPercent: 115,
        })
        .from(
          "[data-hero-copy]",
          {
            autoAlpha: 0,
            duration: 0.72,
            stagger: 0.1,
            y: 22,
          },
          "-=0.58"
        )
        .from(
          "[data-hero-preview]",
          {
            autoAlpha: 0,
            duration: 1.15,
            y: -42,
          },
          "-=0.94"
        )
        .from(
          '[data-hero-panel="people"]',
          {
            autoAlpha: 0,
            duration: 0.72,
            rotate: -1.5,
            scale: 0.94,
            x: -28,
            y: 14,
          },
          "-=0.55"
        )
        .addLabel("connection-draw", "-=0.22")

      const path =
        heroRef.current?.querySelector<SVGPathElement>("[data-hero-path]")

      if (path) {
        const pathLength = path.getTotalLength()

        timeline.fromTo(
          path,
          {
            strokeDasharray: pathLength,
            strokeDashoffset: pathLength,
          },
          {
            duration: 1.05,
            ease: "power2.inOut",
            strokeDashoffset: 0,
          },
          "connection-draw"
        )
      }

      timeline.from(
        '[data-hero-panel="payroll"]',
        {
          autoAlpha: 0,
          duration: 0.72,
          rotate: 1.5,
          scale: 0.94,
          x: 28,
          y: 18,
        },
        "connection-draw+=0.68"
      )

      timeline.from(
        "[data-hero-node]",
        {
          duration: 0.42,
          ease: "back.out(2)",
          scale: 0,
          stagger: 0.08,
          transformOrigin: "center",
        },
        "connection-draw+=0.62"
      )

      if (heroRef.current) {
        bindScrollAnimation(timeline, {
          start: "top 92%",
          trigger: heroRef.current,
        })
      }
    },
    { scope: heroRef }
  )

  return (
    <section
      ref={heroRef}
      className={cn(
        "relative isolate overflow-hidden border-t border-border/70 bg-background",
        className
      )}
    >
      <Container className="grid min-h-[calc(100svh-4.5rem)] items-center gap-14 py-16 lg:grid-cols-[minmax(0,0.82fr)_minmax(38rem,1.18fr)] lg:gap-8 lg:py-20 xl:gap-14">
        <div className="relative z-10 max-w-2xl">
          <h1 className="overflow-hidden font-heading text-[clamp(3rem,6vw,5.75rem)] leading-[0.98] font-bold tracking-[-0.065em] text-balance">
            <span data-hero-title className="block">
              Your workforce, in one clear view.
            </span>
          </h1>
          <p
            data-hero-copy
            className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9"
          >
            Bring people, time, payroll, and performance together—so every team
            can move with confidence.
          </p>

          <div data-hero-copy className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to={siteRoutes.demoRequest.path}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-13 w-full px-7 text-base font-semibold sm:w-auto"
              )}
            >
              Start free
            </Link>
            <Link
              to={siteRoutes.features.path}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-13 w-full px-7 text-base font-semibold sm:w-auto"
              )}
            >
              Explore the platform
            </Link>
          </div>

          <p
            data-hero-copy
            className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Check aria-hidden="true" className="size-4 text-primary" />
            No credit card required
            <span aria-hidden="true" className="text-border">
              ·
            </span>
            Set up in minutes
          </p>
        </div>

        <WorkforcePreview />
      </Container>
    </section>
  )
}

function WorkforcePreview() {
  return (
    <div
      aria-label="Workforce ERP product preview"
      className="relative mx-auto w-full max-w-[760px] transform-gpu py-8 will-change-transform [perspective:1200px] lg:py-0"
      data-hero-preview
      role="img"
    >
      <div className="absolute inset-x-[12%] top-[9%] bottom-[8%] rounded bg-primary/6 blur-3xl" />

      <div className="relative overflow-hidden rounded border border-foreground/20 bg-card shadow-[0_28px_70px_-38px_oklch(0.145_0_0_/_0.42)]">
        <div className="grid min-h-[510px] grid-cols-[7.25rem_minmax(0,1fr)] sm:grid-cols-[8.5rem_minmax(0,1fr)]">
          <aside className="border-r border-border bg-muted/25 p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[10px] font-bold sm:text-xs">
              <span className="font-heading text-xl leading-none font-extrabold text-primary">
                W
              </span>
              <span className="hidden sm:inline">Workforce ERP</span>
            </div>
            <nav aria-label="Product preview" className="mt-6 space-y-1">
              {[
                ["Home", Users],
                ["People", Users],
                ["Time", Clock3],
                ["Leave", CalendarDays],
                ["Payroll", Check],
              ].map(([label, Icon], index) => (
                <div
                  key={label as string}
                  className={cn(
                    "flex items-center gap-2 rounded px-2 py-2 text-[10px] sm:text-xs",
                    index === 0
                      ? "bg-primary/10 font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon aria-hidden="true" className="size-3.5" />
                  {label as string}
                </div>
              ))}
            </nav>
          </aside>

          <div className="relative p-4 sm:p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  Tuesday, 18 July
                </p>
                <p className="mt-1 font-heading text-lg font-bold">
                  Good morning, Olivia
                </p>
              </div>
              <div className="hidden size-9 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground sm:flex">
                OD
              </div>
            </div>

            <div className="rounded border border-border bg-background p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-heading text-sm font-bold sm:text-base">
                    Attendance overview
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                    Today across all departments
                  </p>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 rounded border border-border px-2 py-1.5 text-[10px] font-medium sm:text-xs"
                >
                  This week
                  <ChevronDown aria-hidden="true" className="size-3" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-4 divide-x divide-border rounded-lg border border-border">
                {[
                  ["128", "Headcount"],
                  ["109", "Present"],
                  ["12", "On leave"],
                  ["7", "Absent"],
                ].map(([value, label]) => (
                  <div key={label} className="px-2 py-3 sm:px-3">
                    <p className="font-heading text-base font-bold sm:text-xl">
                      {value}
                    </p>
                    <p className="mt-1 truncate text-[8px] text-muted-foreground sm:text-[10px]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-border">
                <div className="grid grid-cols-[1.25fr_0.8fr_0.8fr_0.65fr] bg-muted/60 px-3 py-2 text-[8px] font-medium text-muted-foreground sm:text-[10px]">
                  <span>Name</span>
                  <span>Status</span>
                  <span>Check-in</span>
                  <span className="text-right">Hours</span>
                </div>
                {attendance.map((person) => (
                  <div
                    key={person.name}
                    className="grid grid-cols-[1.25fr_0.8fr_0.8fr_0.65fr] items-center border-t border-border px-3 py-2.5 text-[8px] sm:text-[10px]"
                  >
                    <span className="truncate font-semibold">
                      {person.name}
                    </span>
                    <span
                      className={cn(
                        "w-fit rounded px-1.5 py-0.5",
                        person.status === "Present"
                          ? "bg-primary/10 text-primary"
                          : "bg-amber-100 text-amber-800"
                      )}
                    >
                      {person.status}
                    </span>
                    <span className="text-muted-foreground">{person.time}</span>
                    <span className="text-right">{person.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConnectiveLine />
      <PeoplePanel />
      <PayrollPanel />
    </div>
  )
}

function PeoplePanel() {
  return (
    <div
      data-hero-panel="people"
      className="absolute top-[27%] -left-2 hidden w-48 rounded border border-border bg-card p-3 shadow-xl sm:block lg:-left-8 xl:-left-12"
    >
      <p className="text-xs font-bold">People</p>
      <div className="mt-2 flex items-center gap-1.5 rounded border border-border px-2 py-1.5 text-[9px] text-muted-foreground">
        <Search aria-hidden="true" className="size-3" />
        Search people…
      </div>
      <div className="mt-2 space-y-1">
        {employees.map((employee) => (
          <div key={employee.name} className="flex items-center gap-2 py-1.5">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded text-[8px] font-bold",
                employee.tone
              )}
            >
              {employee.initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[9px] font-semibold">
                {employee.name}
              </span>
              <span className="block truncate text-[8px] text-muted-foreground">
                {employee.role}
              </span>
            </span>
            <span className="ml-auto size-1.5 rounded bg-primary" />
          </div>
        ))}
      </div>
    </div>
  )
}

function PayrollPanel() {
  return (
    <div
      data-hero-panel="payroll"
      className="absolute right-0 bottom-[5%] w-52 rounded border border-border bg-card p-4 shadow-2xl sm:w-60 lg:-right-4 xl:-right-9"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold sm:text-sm">Payroll approval</p>
        <span className="rounded bg-primary/10 px-2 py-1 text-[8px] font-semibold text-primary">
          Ready
        </span>
      </div>
      <p className="mt-1 text-[9px] text-muted-foreground">1–31 July 2026</p>
      <dl className="mt-4 space-y-2 border-y border-border py-3 text-[9px] sm:text-[10px]">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Gross pay</dt>
          <dd className="font-medium">$458,732.40</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Deductions</dt>
          <dd className="font-medium">$96,211.34</dd>
        </div>
        <div className="flex justify-between gap-3 text-primary">
          <dt className="font-semibold">Net pay</dt>
          <dd className="font-bold">$320,125.95</dd>
        </div>
      </dl>
      <button
        type="button"
        className="mt-3 flex h-8 w-full items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground"
      >
        Approve payroll
      </button>
    </div>
  )
}

function ConnectiveLine() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden size-full overflow-visible text-primary sm:block"
      viewBox="0 0 760 560"
      fill="none"
      preserveAspectRatio="none"
    >
      <path
        data-hero-path
        d="M147 207C194 207 185 93 267 93H663C698 93 703 122 703 151V444C703 481 671 491 638 491H229C193 491 181 466 181 435V357"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle data-hero-node cx="147" cy="207" r="5" fill="currentColor" />
      <circle data-hero-node cx="703" cy="151" r="5" fill="currentColor" />
      <circle data-hero-node cx="181" cy="357" r="5" fill="currentColor" />
      <circle data-hero-node cx="638" cy="491" r="5" fill="currentColor" />
    </svg>
  )
}
