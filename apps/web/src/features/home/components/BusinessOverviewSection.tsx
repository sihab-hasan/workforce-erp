import { useRef } from "react";
import { BarChart3, Building2, FileCheck2, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { Container } from "#layouts/Container";
import { cn } from "@workforce-erp/ui/lib/utils";
import { bindScrollAnimation, gsap, prefersReducedMotion, useGSAP } from "@workforce-erp/ui/motion";

export interface BusinessOverviewSectionProps {
  className?: string;
}

const metrics = [
  {
    icon: Users,
    value: "250K+",
    label: "Active Employees",
    description:
      "Managed across global organizations in 45+ countries with full multi-tenant isolation.",
    accent: "from-sky-500/20 to-blue-500/20 text-sky-500",
  },
  {
    icon: Building2,
    value: "1,200+",
    label: "Organizations",
    description: "Multi-company, multi-branch architecture with hierarchical department trees.",
    accent: "from-emerald-500/20 to-teal-500/20 text-emerald-500",
  },
  {
    icon: FileCheck2,
    value: "14M+",
    label: "Timesheets Processed",
    description:
      "Server-authoritative clock-in/out with real-time overlap prevention and correction workflows.",
    accent: "from-amber-500/20 to-orange-500/20 text-amber-500",
  },
  {
    icon: ShieldCheck,
    value: "99.99%",
    label: "Uptime SLA",
    description:
      "Zero-trust security, SOC 2 Type II compliance, and immutable cryptographic audit trails.",
    accent: "from-violet-500/20 to-purple-500/20 text-violet-500",
  },
  {
    icon: BarChart3,
    value: "$1.2B+",
    label: "Payroll Processed",
    description:
      "Accurate multi-currency payroll with zero compliance breaches across all deployments.",
    accent: "from-rose-500/20 to-pink-500/20 text-rose-500",
  },
  {
    icon: TrendingUp,
    value: "42%",
    label: "Faster Operations",
    description:
      "Average reduction in administrative overhead after migrating from legacy point solutions.",
    accent: "from-cyan-500/20 to-sky-500/20 text-cyan-500",
  },
];

export function BusinessOverviewSection({ className }: BusinessOverviewSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ paused: true });
      tl.from("[data-biz-heading]", { autoAlpha: 0, y: 30, duration: 0.7 }).from(
        "[data-biz-card]",
        { autoAlpha: 0, y: 40, stagger: 0.1, duration: 0.6 },
        "-=0.3",
      );
      if (sectionRef.current) {
        bindScrollAnimation(tl, { trigger: sectionRef.current, start: "top 85%" });
      }
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className={cn("py-20 lg:py-28 border-b border-border/60 bg-muted/10", className)}
    >
      <Container>
        <div data-biz-heading className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            Platform at a Glance
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Enterprise-Grade Metrics That Speak for Themselves
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Numbers backed by a multi-tenant architecture engineered for reliability, security, and
            scale from day one.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                data-biz-card
                className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div
                  aria-hidden="true"
                  className={cn(
                    "absolute -right-10 -top-10 size-32 rounded-full bg-gradient-to-br blur-2xl opacity-15 transition-opacity group-hover:opacity-30",
                    m.accent,
                  )}
                />
                <div className="relative z-10">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </div>
                  <p className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-foreground">
                    {m.value}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{m.label}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {m.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
