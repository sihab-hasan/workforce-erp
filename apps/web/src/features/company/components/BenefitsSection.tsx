import {
  ArrowRight,
  BookOpen,
  Globe,
  Heart,
  Laptop,
  Smile,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { WEB_PATHS } from "#routes/paths";
import { Container } from "#layouts/Container";
import { buttonVariants } from "@workforce-erp/ui/components/button";
import { cn } from "@workforce-erp/ui/lib/utils";
import type { CompanyBenefit } from "../types/company.types";

interface BenefitsSectionProps {
  benefits: CompanyBenefit[];
  className?: string | undefined;
}

const benefitIcons: Record<string, LucideIcon> = {
  Globe,
  Heart,
  BookOpen,
  Smile,
  Laptop,
  TrendingUp,
};

export function BenefitsSection({ benefits, className }: BenefitsSectionProps) {
  return (
    <section id="benefits" className={cn("py-20 lg:py-28 bg-muted/15 border-b border-border/60", className)}>
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            Life at Workforce ERP
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Built for Autonomy, Wellness & Growth
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            We practice what we preach. We give our team members the tools, trust, and flexibility they need to do the best work of their lives.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefitIcons[benefit.icon] || Globe;
            return (
              <div
                key={benefit.title}
                className="group rounded-2xl border border-border/70 bg-card p-6 shadow-xs transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Careers Callout Box */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-primary/5 p-8 shadow-sm sm:p-10 lg:flex lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h3 className="font-heading text-2xl font-bold text-foreground">
              Ready to shape the future of enterprise software?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We are expanding our distributed teams across backend engineering, cloud systems, product design, and customer success.
            </p>
          </div>
          <div className="mt-6 shrink-0 lg:mt-0">
            <Link
              to={WEB_PATHS.contact}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 px-6 font-semibold shadow-xs",
              )}
            >
              <span>Get in Touch With Us</span>
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
