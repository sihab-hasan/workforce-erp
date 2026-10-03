import { useRef } from "react";
import { Activity, BrainCircuit, LineChart, Sparkles, Target, TrendingUp } from "lucide-react";
import { Container } from "#layouts/Container";
import { cn } from "@workforce-erp/ui/lib/utils";
import { bindScrollAnimation, gsap, prefersReducedMotion, useGSAP } from "@workforce-erp/ui/motion";

export interface AiInsightsSectionProps {
  className?: string;
}

const insights = [
  {
    icon: TrendingUp,
    title: "Predictive Attrition Signals",
    description:
      "Surface early indicators of disengagement by correlating leave patterns, attendance anomalies, and timesheet irregularities.",
    tag: "Predictive",
  },
  {
    icon: Target,
    title: "Workforce Capacity Forecasting",
    description:
      "Project headcount, overtime exposure, and departmental load weeks ahead based on historical workforce data.",
    tag: "Forecasting",
  },
  {
    icon: Activity,
    title: "Anomaly Detection Engine",
    description:
      "Automatically flag duplicate punches, ghost timesheets, and suspicious approval patterns in real time.",
    tag: "Detection",
  },
  {
    icon: LineChart,
    title: "Executive Intelligence Summaries",
    description:
      "Auto-generated digest reports highlighting attendance trends, leave utilization, and compliance health scores.",
    tag: "Reporting",
  },
];

export function AiInsightsSection({ className }: AiInsightsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ paused: true });
      tl.from("[data-ai-heading]", { autoAlpha: 0, y: 26, duration: 0.65 }).from(
        "[data-ai-card]",
        { autoAlpha: 0, y: 30, stagger: 0.1, duration: 0.55 },
        "-=0.3",
      );
      if (sectionRef.current) {
        bindScrollAnimation(tl, { trigger: sectionRef.current, start: "top 85%" });
      }
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className={cn("py-20 lg:py-28 border-b border-border/60", className)}>
      <Container>
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-16">
          {/* Left: Heading */}
          <div data-ai-heading>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <BrainCircuit className="size-3.5" />
              Intelligent Workforce Analytics
            </div>
            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Data-Driven Decisions, Not Gut Feelings
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              The platform continuously analyzes workforce patterns to surface actionable
              intelligence—so leaders can act proactively, not reactively.
            </p>

            {/* Mini dashboard preview */}
            <div className="mt-8 rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Workforce Health Score</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-600">
                  Excellent
                </span>
              </div>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-primary via-emerald-500 to-teal-500" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                {[
                  ["92%", "Attendance"],
                  ["96%", "Compliance"],
                  ["88%", "Satisfaction"],
                ].map(([val, label]) => (
                  <div key={label}>
                    <p className="font-heading text-lg font-bold text-foreground">{val}</p>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Insight Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {insights.map((ins) => {
              const Icon = ins.icon;
              return (
                <div
                  key={ins.title}
                  data-ai-card
                  className="group rounded-2xl border border-border/70 bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-5" />
                    </div>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {ins.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-foreground">{ins.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {ins.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
