import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { WEB_PATHS } from "#routes/paths";
import { Container } from "#layouts/Container";
import { buttonVariants } from "@workforce-erp/ui/components/button";
import { cn } from "@workforce-erp/ui/lib/utils";
import type { CompanyInfo } from "../types/company.types";

interface CompanyHeroSectionProps {
  company: CompanyInfo;
  className?: string | undefined;
}

export function CompanyHeroSection({ company, className }: CompanyHeroSectionProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden border-b border-border/70 bg-gradient-to-b from-background via-background to-muted/20 py-20 lg:py-28",
        className,
      )}
    >
      {/* Background radial glow & geometric grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[550px] w-[900px] -translate-x-1/2 transform-gpu overflow-hidden blur-3xl opacity-30 dark:opacity-20"
      >
        <div className="h-full w-full bg-gradient-to-tr from-primary via-emerald-500 to-sky-500" />
      </div>

      <Container className="relative z-10 text-center">
        {/* Certification / Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md shadow-xs">
          <Sparkles className="size-3.5 animate-pulse text-primary" />
          <span>{company.tagline}</span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
            Est. {company.founded_year}
          </span>
        </div>

        {/* Main Title with subtle gradient */}
        <h1 className="mx-auto mt-7 max-w-4xl font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          {company.headline}
        </h1>

        {/* Lead Description */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
          {company.description}
        </p>

        {/* Quick Anchor Navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {[
            { label: "Our Story", href: "#story" },
            { label: "Core Values", href: "#values" },
            { label: "Milestones", href: "#timeline" },
            { label: "Leadership", href: "#leadership" },
            { label: "Global Hubs", href: "#offices" },
            { label: "Culture & Perks", href: "#benefits" },
          ].map((pill) => (
            <a
              key={pill.label}
              href={pill.href}
              className="rounded-full border border-border/80 bg-background/80 px-3.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-xs transition hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
            >
              {pill.label}
            </a>
          ))}
        </div>

        {/* CTA Action Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to={WEB_PATHS.contact}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 w-full px-8 text-base font-semibold shadow-md sm:w-auto",
            )}
          >
            <span>Partner With Us</span>
            <ArrowRight className="ml-2 size-4" />
          </Link>
          <a
            href="#story"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 w-full px-8 text-base font-semibold sm:w-auto",
            )}
          >
            Read Our Story
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-6 text-xs text-muted-foreground border-t border-border/40 max-w-3xl mx-auto">
          {company.certifications.map((cert) => (
            <div key={cert} className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span>{cert}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="size-4 text-primary" />
            <span>Headquartered in {company.headquarters}</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
