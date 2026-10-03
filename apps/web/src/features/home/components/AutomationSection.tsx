import { useRef } from "react";
import { ArrowRight, CheckCircle2, GitBranch, RefreshCcw, Workflow, Zap } from "lucide-react";
import { Container } from "#layouts/Container";
import { cn } from "@workforce-erp/ui/lib/utils";
import { bindScrollAnimation, gsap, prefersReducedMotion, useGSAP } from "@workforce-erp/ui/motion";

export interface AutomationSectionProps {
  className?: string;
}

const automations = [
  {
    icon: Workflow,
    title: "Multi-Level Approval Chains",
    description:
      "Leave requests, timesheets, and document submissions route through configurable approval hierarchies automatically.",
  },
  {
    icon: RefreshCcw,
    title: "Real-Time Sync Engine",
    description:
      "Employee data, attendance records, and organizational changes propagate instantly across every connected module.",
  },
  {
    icon: GitBranch,
    title: "Conditional Policy Enforcement",
    description:
      "Business rules like SoD, data scoping, and entitlement checks run server-side before every sensitive operation.",
  },
  {
    icon: Zap,
    title: "Event-Driven Notifications",
    description:
      "Clock-in confirmations, approval alerts, and deadline reminders dispatch automatically via the notification engine.",
  },
];

const pipeline = [
  { step: "01", label: "Employee Action", sub: "Clock-in, leave request, document upload" },
  { step: "02", label: "Validation Engine", sub: "Server-side rules, overlap checks, SoD" },
  { step: "03", label: "Approval Routing", sub: "Auto-routed to configured approval chain" },
  { step: "04", label: "Instant Resolution", sub: "Real-time sync, audit log, notification" },
];

export function AutomationSection({ className }: AutomationSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ paused: true });
      tl.from("[data-auto-heading]", { autoAlpha: 0, y: 26, duration: 0.65 })
        .from("[data-auto-pipe]", { autoAlpha: 0, x: -30, stagger: 0.1, duration: 0.5 }, "-=0.3")
        .from("[data-auto-card]", { autoAlpha: 0, y: 30, stagger: 0.08, duration: 0.5 }, "-=0.4");
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
        <div data-auto-heading className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            Built-In Automation
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Eliminate Manual Busywork, Permanently
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Every workflow runs through a server-authoritative validation engine—no client-side
            hacks, no data inconsistencies.
          </p>
        </div>

        {/* Pipeline Visualization */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pipeline.map((p, i) => (
            <div key={p.step} data-auto-pipe className="relative">
              <div className="rounded-2xl border border-border/70 bg-card p-6 transition hover:border-primary/40 hover:shadow-sm">
                <span className="font-mono text-3xl font-extrabold text-primary/30">{p.step}</span>
                <h3 className="mt-2 text-sm font-bold text-foreground">{p.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{p.sub}</p>
              </div>
              {i < pipeline.length - 1 && (
                <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ArrowRight className="size-3" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Automation Feature Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {automations.map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.title}
                data-auto-card
                className="group flex gap-5 rounded-2xl border border-border/70 bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-foreground">{a.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {a.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom trust strip */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
          {[
            "Zero manual reconciliation",
            "Sub-second validation",
            "Full audit trail",
            "No cron dependencies",
          ].map((t) => (
            <span key={t} className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              {t}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}
