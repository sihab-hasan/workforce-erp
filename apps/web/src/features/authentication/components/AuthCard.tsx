import type { ReactNode } from "react";
import { Building2, CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";

import { cn } from "@workforce-erp/ui/lib/utils";

interface AuthCardProps {
  /** Icon rendered inside the form badge. Defaults to Building2. */
  icon?: ReactNode;
  heading: string;
  subheading: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Shared full-page authentication shell used by every authentication screen.
 * Keeps authentication content consistent without changing any auth behavior.
 */
export function AuthCard({
  icon,
  heading,
  subheading,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <main className={cn("min-h-svh bg-background lg:grid lg:grid-cols-2", className)}>
      <section
        aria-label="Workforce ERP portal"
        className="relative hidden min-h-svh overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16"
      >
        <div
          aria-hidden="true"
          className="absolute -top-28 -right-28 size-96 rounded-full border border-primary-foreground/15"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 -left-24 size-[30rem] rounded-full border border-primary-foreground/10"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49.8%,rgba(255,255,255,0.05)_50%,transparent_50.2%),linear-gradient(to_bottom,transparent_0%,transparent_49.8%,rgba(255,255,255,0.05)_50%,transparent_50.2%)] bg-[size:72px_72px]"
        />

        <div className="relative flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded bg-primary-foreground/12 ring-1 ring-primary-foreground/20">
            <Building2 className="size-5" />
          </div>
          <div>
            <p className="font-heading text-lg font-semibold tracking-tight">Workforce ERP</p>
            <p className="text-sm text-primary-foreground/70">Organization workspace</p>
          </div>
        </div>

        <div className="relative max-w-xl">
          <p className="mb-4 text-sm font-medium tracking-wide text-primary-foreground/75 uppercase">
            Secure workspace access
          </p>
          <h2 className="font-heading text-4xl leading-tight font-semibold tracking-tight xl:text-5xl">
            One secure place to run your workforce operations.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-primary-foreground/75 xl:text-lg">
            Access the people, finance, operations, and administrative tools your organization uses
            every day.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-primary-foreground/80 sm:grid-cols-2">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="size-4 shrink-0" />
              <span>Protected account access</span>
            </div>
            <div className="flex items-center gap-2.5">
              <LockKeyhole className="size-4 shrink-0" />
              <span>Secure sign-in options</span>
            </div>
            <div className="flex items-center gap-2.5 sm:col-span-2">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>Centralized access to your organization workspace</span>
            </div>
          </div>
        </div>

        <p className="relative text-sm text-primary-foreground/65">
          © {new Date().getFullYear()} Workforce ERP. All rights reserved.
        </p>
      </section>

      <section className="flex min-h-svh items-center justify-center px-4 py-10 sm:px-8 lg:px-10 xl:px-14">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded bg-primary/10 text-primary">
              <Building2 className="size-4" />
            </div>
            <span className="font-heading font-semibold tracking-tight text-foreground">
              Workforce ERP
            </span>
          </div>

          <div className="rounded bg-card px-6 py-8 shadow-xl ring-1 ring-border/60 sm:px-8 sm:py-10">
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded bg-primary/10 text-primary">
                {icon ?? <Building2 className="size-6" />}
              </div>
              <div className="flex flex-col gap-1.5">
                <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                  {heading}
                </h1>
                <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground">
                  {subheading}
                </p>
              </div>
            </div>

            {children}

            {footer && (
              <div className="mt-6 border-t border-border/70 pt-5 text-center text-sm text-muted-foreground">
                {footer}
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground lg:hidden">
            © {new Date().getFullYear()} Workforce ERP. All rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}
