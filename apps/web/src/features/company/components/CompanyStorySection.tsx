import { Check, Quote, X, Zap } from "lucide-react";
import { Container } from "#layouts/Container";
import { cn } from "@workforce-erp/ui/lib/utils";
import type { CompanyStory } from "../types/company.types";

interface CompanyStorySectionProps {
  story: CompanyStory;
  className?: string | undefined;
}

const comparisonPoints = [
  {
    legacy: "7+ fragmented point solutions with broken sync",
    workforce: "One unified real-time workforce operating system",
  },
  {
    legacy: "Hours of manual timesheet & attendance reconciliation",
    workforce: "Server-authoritative punches with automated conflict detection",
  },
  {
    legacy: "High-stress audit panic and opaque permission sprawl",
    workforce: "Immutable cryptographic audit logs & native SoD enforcement",
  },
  {
    legacy: "Clunky 90s interfaces that employees actively avoid",
    workforce: "Fluid, high-velocity experience crafted for modern teams",
  },
];

export function CompanyStorySection({ story, className }: CompanyStorySectionProps) {
  return (
    <section id="story" className={cn("py-20 lg:py-28 border-b border-border/60", className)}>
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            {story.badge}
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {story.title}
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {story.summary}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column: Narrative & Quote */}
          <div className="space-y-6">
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              {story.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Founder Quote Card */}
            <div className="relative mt-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background p-6 shadow-sm">
              <Quote className="size-8 text-primary/30 mb-2" />
              <blockquote className="text-base font-medium italic text-foreground/90">
                "{story.quote.text}"
              </blockquote>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary font-bold text-xs text-primary-foreground">
                  SH
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{story.quote.author}</p>
                  <p className="text-xs text-muted-foreground">{story.quote.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Comparison */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-md sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="size-4" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">
                Architectural Shift
              </h3>
            </div>

            <div className="space-y-4">
              {comparisonPoints.map((point, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border/60 bg-muted/20 p-4 transition hover:bg-muted/40"
                >
                  {/* Legacy row */}
                  <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive mt-0.5">
                      <X className="size-3" />
                    </div>
                    <span className="line-through opacity-80">{point.legacy}</span>
                  </div>

                  {/* Workforce row */}
                  <div className="mt-2.5 flex items-start gap-2.5 text-sm font-semibold text-foreground">
                    <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 mt-0.5">
                      <Check className="size-3" />
                    </div>
                    <span>{point.workforce}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-primary/10 p-3.5 text-center text-xs font-medium text-primary">
              Multi-tenant isolation · Real-time attendance · Zero data loss
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
