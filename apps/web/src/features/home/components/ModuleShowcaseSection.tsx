import { useRef } from "react";
import {
  CalendarDays,
  Clock,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Container } from "#layouts/Container";
import { cn } from "@workforce-erp/ui/lib/utils";
import { bindScrollAnimation, gsap, prefersReducedMotion, useGSAP } from "@workforce-erp/ui/motion";

export interface ModuleShowcaseSectionProps {
  className?: string;
}

interface Module {
  icon: LucideIcon;
  title: string;
  tagline: string;
  bullets: string[];
  accent: string;
}

const modules: Module[] = [
  {
    icon: Users,
    title: "People & Organization",
    tagline: "The single source of truth for every employee.",
    bullets: [
      "Multi-company, multi-branch employee directory",
      "Dynamic department trees & designation hierarchy",
      "Custom profile fields, emergency contacts, documents",
      "Bulk import/export with data validation",
    ],
    accent: "border-sky-500/40 bg-sky-500/5 hover:border-sky-500/80",
  },
  {
    icon: Clock,
    title: "Time & Attendance",
    tagline: "Server-authoritative punches, zero disputes.",
    bullets: [
      "Real-time clock-in/clock-out with overlap prevention",
      "Manager correction & approval workflows",
      "Shift scheduling with timezone awareness",
      "Automated timesheet reconciliation engine",
    ],
    accent: "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/80",
  },
  {
    icon: CalendarDays,
    title: "Leave Management",
    tagline: "Fair policies, instant approvals.",
    bullets: [
      "Configurable leave types with accrual rules",
      "Multi-level approval chains",
      "Calendar view with team availability",
      "Carryover, encashment & pro-rata calculations",
    ],
    accent: "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/80",
  },
  {
    icon: FileText,
    title: "Documents & Compliance",
    tagline: "Every record, secured and searchable.",
    bullets: [
      "Centralized document vault with access controls",
      "Expiry tracking & renewal notifications",
      "Employee self-service document uploads",
      "Audit-ready compliance reports",
    ],
    accent: "border-violet-500/40 bg-violet-500/5 hover:border-violet-500/80",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboards & Reports",
    tagline: "Real-time insights, one glance.",
    bullets: [
      "Executive workforce overview dashboard",
      "Department-level headcount & attendance analytics",
      "Leave utilization & trend reports",
      "Custom date-range filtering & export",
    ],
    accent: "border-rose-500/40 bg-rose-500/5 hover:border-rose-500/80",
  },
  {
    icon: ShieldCheck,
    title: "Security & Governance",
    tagline: "Zero-trust, non-negotiable compliance.",
    bullets: [
      "RBAC with granular permission matrix",
      "Segregation of Duties (SoD) enforcement",
      "Immutable cryptographic audit trail",
      "SSO (Google / Microsoft Entra) + step-up MFA",
    ],
    accent: "border-cyan-500/40 bg-cyan-500/5 hover:border-cyan-500/80",
  },
];

export function ModuleShowcaseSection({ className }: ModuleShowcaseSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ paused: true });
      tl.from("[data-mod-heading]", { autoAlpha: 0, y: 30, duration: 0.7 })
        .from("[data-mod-card]", { autoAlpha: 0, y: 40, stagger: 0.08, duration: 0.55 }, "-=0.3");
      if (sectionRef.current) {
        bindScrollAnimation(tl, { trigger: sectionRef.current, start: "top 85%" });
      }
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className={cn("py-20 lg:py-28 border-b border-border/60", className)}
    >
      <Container>
        <div data-mod-heading className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            Core Modules
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Six Unified Modules, One Operating System
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Every module is deeply integrated—no fragile connectors, no data silos. Changes propagate instantly across the entire platform.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                data-mod-card
                className={cn(
                  "group rounded-2xl border-2 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                  mod.accent,
                )}
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Icon className="size-6" />
                </div>

                <h3 className="mt-5 font-heading text-xl font-bold text-foreground">
                  {mod.title}
                </h3>
                <p className="mt-1 text-xs font-semibold text-primary italic">
                  {mod.tagline}
                </p>

                <ul className="mt-4 space-y-2">
                  {mod.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
