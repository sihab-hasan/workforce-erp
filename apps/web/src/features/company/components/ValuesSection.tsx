import {
  Award,
  Eye,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Container } from "#layouts/Container";
import { cn } from "@workforce-erp/ui/lib/utils";
import type { CompanyValue } from "../types/company.types";

interface ValuesSectionProps {
  values: CompanyValue[];
  className?: string | undefined;
}

const valueIcons: Record<string, LucideIcon> = {
  HeartHandshake,
  ShieldCheck,
  Zap,
  Eye,
  Sparkles,
  Award,
};

export function ValuesSection({ values, className }: ValuesSectionProps) {
  return (
    <section id="values" className={cn("py-20 lg:py-28 bg-muted/15 border-b border-border/60", className)}>
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            Our Principles
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Values That Drive Everything We Build
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            These core principles guide our engineering architecture, product design, and how we treat our customers and each other every day.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((val) => {
            const Icon = valueIcons[val.icon] || Sparkles;
            return (
              <div
                key={val.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                {/* Glow accent */}
                <div
                  className={cn(
                    "absolute -right-12 -top-12 size-36 rounded-full bg-gradient-to-br blur-2xl opacity-15 transition-opacity group-hover:opacity-30",
                    val.accent,
                  )}
                />

                <div>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <Icon className="size-6" />
                  </div>

                  <h3 className="mt-5 font-heading text-xl font-bold text-foreground">
                    {val.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-primary">
                    {val.tagline}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {val.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono text-[11px] uppercase tracking-wider">
                    Principle #{val.id}
                  </span>
                  <span className="size-1.5 rounded-full bg-primary/60 group-hover:bg-primary" />
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
