import type { ReactNode } from "react";
import { Building2, CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";

import { Logo, LogoIcon } from "@workforce-erp/ui/components/logo";
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
    <main className={cn("relative min-h-svh overflow-hidden bg-background lg:grid lg:grid-cols-2", className)}>
      {/* Dynamic ambient radial glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-[32rem] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/15" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-[32rem] rounded-full bg-teal-500/10 blur-[120px] dark:bg-teal-500/15" />

      {/* ── Left Hero Panel (Large screens) ────────────────────────────────── */}
      <section
        aria-label="Workforce ERP Platform"
        className="relative hidden min-h-svh overflow-hidden border-r border-border/50 bg-gradient-to-br from-primary via-primary/95 to-emerald-900 text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16"
      >
        {/* Subtle geometric & grid textures */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 size-[28rem] rounded-full border border-primary-foreground/15 blur-[1px]"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-36 -left-20 size-[34rem] rounded-full border border-primary-foreground/10 blur-[2px]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px] opacity-70"
        />

        <div className="relative flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded bg-primary-foreground/12 ring-1 ring-primary-foreground/20">
            <LogoIcon className="size-6 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-heading text-lg font-bold tracking-tight text-white">Workforce ERP</p>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase backdrop-blur-xs">
                Platform
              </span>
            </div>
            <p className="text-xs text-white/75">Enterprise Administration Console</p>
          </div>
        </div>

        {/* Center Hero Copy */}
        <div className="relative max-w-xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium tracking-wide text-white/90 backdrop-blur-md">
            <span className="size-2 rounded-full bg-emerald-300 animate-pulse" />
            <span>High-Security Isolated Control Plane</span>
          </div>

          <h2 className="font-heading text-4xl leading-[1.15] font-bold tracking-tight text-white xl:text-5xl">
            Unified governance across all your enterprise tenants.
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
            Provision organizations, audit tenant lifecycle operations, enforce security policies, and manage global platform access with full audit traceability.
          </p>

          <div className="mt-8 grid gap-3.5 text-xs text-white/90 sm:grid-cols-2 sm:text-sm">
            <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
              <ShieldCheck className="size-4 shrink-0 text-emerald-300" />
              <span>Zero-Trust RBAC & Auditing</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
              <LockKeyhole className="size-4 shrink-0 text-teal-300" />
              <span>Multi-Tenant Vault Isolation</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm sm:col-span-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-300" />
              <span>Real-time cross-tenant telemetry, analytics & system health</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative flex items-center justify-between text-xs text-white/65">
          <p>© {new Date().getFullYear()} Workforce ERP Inc. All rights reserved.</p>
          <span className="font-mono">v1.0.0-LTS</span>
        </div>
      </section>

      {/* ── Right Form Container ─────────────────────────────────────────── */}
      <section className="relative flex min-h-svh items-center justify-center px-4 py-12 sm:px-8 lg:px-12 xl:px-16">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-center lg:hidden">
            <Logo size="md" />
          </div>

          {/* Glassmorphic Auth Card */}
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/85 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            {/* Top decorative gradient rim */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-emerald-400 to-teal-500" />

            <div className="mb-7 flex flex-col items-center gap-3.5 text-center">
              <div className="relative flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/15 to-primary/5 text-primary shadow-inner">
                {icon ?? <ShieldCheck className="size-7" />}
                <span className="absolute -top-1 -right-1 size-3 rounded-full bg-emerald-500 ring-2 ring-background" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {heading}
                </h1>
                <p className="mx-auto max-w-sm text-xs text-muted-foreground leading-relaxed sm:text-sm">
                  {subheading}
                </p>
              </div>
            </div>

            {children}

            {footer && (
              <div className="mt-6 border-t border-border/60 pt-5 text-center text-xs text-muted-foreground">
                {footer}
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground/80 lg:hidden">
            © {new Date().getFullYear()} Workforce ERP. All rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}
