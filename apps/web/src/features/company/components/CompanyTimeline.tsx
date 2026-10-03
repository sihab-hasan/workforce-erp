import { useState } from "react";
import { Container } from "#layouts/Container";
import { cn } from "@workforce-erp/ui/lib/utils";
import type { TimelineMilestone } from "../types/company.types";

export interface CompanyTimelineProps {
  timeline: TimelineMilestone[];
  className?: string | undefined;
}

export function CompanyTimeline({ timeline, className }: CompanyTimelineProps) {
  const [selectedYear, setSelectedYear] = useState<string>("All");

  const years = ["All", ...Array.from(new Set(timeline.map((m) => m.year)))];

  const filtered =
    selectedYear === "All" ? timeline : timeline.filter((m) => m.year === selectedYear);

  return (
    <section id="timeline" className={cn("py-20 lg:py-28 border-b border-border/60", className)}>
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            Key Milestones
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Our Journey & Architectural Evolution
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            From an ambitious architectural prototype to an enterprise-grade multi-tenant operating
            system.
          </p>

          {/* Year Filter Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {years.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setSelectedYear(year)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200",
                  selectedYear === year
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Line & Cards */}
        <div className="relative mt-16">
          {/* Vertical central line (hidden on mobile, visible on lg) */}
          <div
            aria-hidden="true"
            className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-border lg:left-1/2 lg:-translate-x-1/2"
          />

          <div className="space-y-10 lg:space-y-14">
            {filtered.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={`${item.year}-${item.quarter}-${index}`}
                  className={cn(
                    "relative flex flex-col gap-6 pl-12 lg:flex-row lg:items-center lg:gap-0 lg:pl-0",
                    isEven ? "lg:flex-row-reverse" : "",
                  )}
                >
                  {/* Central Node marker */}
                  <div className="absolute left-2.5 top-1.5 size-4 -translate-x-1/2 rounded-full border-4 border-background bg-primary shadow-xs lg:left-1/2" />

                  {/* Content Card (Left or Right on desktop) */}
                  <div className="w-full lg:w-1/2 lg:px-10">
                    <div
                      className={cn(
                        "group rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition hover:border-primary/40 hover:shadow-md",
                        isEven ? "lg:text-right" : "lg:text-left",
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-2 text-xs font-semibold text-primary",
                          isEven ? "lg:justify-end" : "justify-start",
                        )}
                      >
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono">
                          {item.year} · {item.quarter}
                        </span>
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground font-medium">
                          {item.tag}
                        </span>
                      </div>

                      <h3 className="mt-3 font-heading text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Empty side for layout balance on large screens */}
                  <div className="hidden lg:block lg:w-1/2" />
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
