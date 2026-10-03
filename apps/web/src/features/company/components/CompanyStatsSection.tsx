import { Clock, DollarSign, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import { Container } from "#layouts/Container";
import { cn } from "@workforce-erp/ui/lib/utils";
import type { CompanyStat } from "../types/company.types";

interface CompanyStatsSectionProps {
  stats: CompanyStat[];
  className?: string | undefined;
}

const iconMap: Record<string, LucideIcon> = {
  Users,
  ShieldCheck,
  Clock,
  DollarSign,
};

export function CompanyStatsSection({ stats, className }: CompanyStatsSectionProps) {
  return (
    <section className={cn("relative -mt-10 z-20", className)}>
      <Container>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = iconMap[stat.icon] || Users;
            return (
              <div
                key={stat.id}
                className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {stat.highlight}
                  </span>
                </div>

                <div className="mt-5">
                  <p className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{stat.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.subtext}</p>
                </div>

                {/* Subtle gradient highlight line */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition group-hover:opacity-100" />
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
