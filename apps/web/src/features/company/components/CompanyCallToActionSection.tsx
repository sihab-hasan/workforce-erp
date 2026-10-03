import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { WEB_PATHS } from "#routes/paths";
import { Container } from "#layouts/Container";
import { buttonVariants } from "@workforce-erp/ui/components/button";
import { cn } from "@workforce-erp/ui/lib/utils";

interface CompanyCallToActionSectionProps {
  className?: string | undefined;
}

export function CompanyCallToActionSection({ className }: CompanyCallToActionSectionProps) {
  return (
    <section
      className={cn("relative isolate overflow-hidden py-20 lg:py-28 bg-background", className)}
    >
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/10 p-8 shadow-xl sm:p-12 lg:p-16">
          {/* Subtle background glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 -z-10 size-96 rounded-full bg-primary/20 blur-3xl"
          />

          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              <span>Experience Next-Gen Operations</span>
            </div>

            <h2 className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Ready to Upgrade Your Entire Workforce Experience?
            </h2>

            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Say goodbye to disconnected spreadsheets, fractured attendance, and manual
              reconciliation. Bring all your people, time, and payroll together in one unified
              operating system.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/erp/sign-up"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 w-full px-8 text-base font-semibold shadow-md sm:w-auto",
                )}
              >
                <span>Start Free Trial</span>
                <ArrowRight className="ml-2 size-4" />
              </a>
              <Link
                to={WEB_PATHS.contact}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 w-full px-8 text-base font-semibold sm:w-auto",
                )}
              >
                Request Custom Demo
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                14-day free trial
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" />
                SOC 2 Type II compliant
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
