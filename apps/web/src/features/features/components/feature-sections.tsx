import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  LayoutDashboard,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { WEB_PATHS } from "#routes/paths";
import { Container } from "#layouts/Container";
import { Section } from "#layouts/Section";
import { buttonVariants } from "@workforce-erp/ui/components/button";
import { cn } from "@workforce-erp/ui/lib/utils";

/* ─── Hero ─── */
export function FeaturesHeroSection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border/70 bg-gradient-to-b from-background via-background to-muted/20 py-20 lg:py-28">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/25 via-emerald-500/20 to-sky-500/20 blur-3xl opacity-30" />
      <Container className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" />
          Platform Capabilities
        </div>
        <h1 className="mx-auto mt-6 max-w-4xl font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Everything Your Workforce Operations Demand
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Six deeply-integrated modules built on a unified multi-tenant architecture. No fragile connectors, no data silos—just real-time operational clarity.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="#modules" className={cn(buttonVariants({ size: "lg" }), "h-12 px-8 text-base font-semibold shadow-md")}>
            Explore Modules
            <ArrowRight className="ml-2 size-4" />
          </a>
          <Link to={WEB_PATHS.contact} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 px-8 text-base font-semibold")}>
            Request a Demo
          </Link>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          {["No credit card required", "14-day free trial", "SOC 2 certified"].map((t) => (
            <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-emerald-500" />{t}</span>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ─── Feature Grid (Core Modules) ─── */
interface ModuleCard {
  icon: LucideIcon;
  title: string;
  tagline: string;
  features: string[];
  accent: string;
}

const featureModules: ModuleCard[] = [
  { icon: Users, title: "People & Organization", tagline: "Single source of truth for every employee record.", features: ["Multi-branch directory", "Department hierarchy trees", "Custom profile fields", "Bulk import/export"], accent: "border-sky-500/40 hover:border-sky-500" },
  { icon: Clock, title: "Time & Attendance", tagline: "Server-authoritative punches with zero disputes.", features: ["Real-time clock-in/out", "Overlap prevention engine", "Manager corrections", "Shift scheduling"], accent: "border-emerald-500/40 hover:border-emerald-500" },
  { icon: CalendarDays, title: "Leave Management", tagline: "Fair policies, instant approvals.", features: ["Configurable leave types", "Multi-level approval chains", "Team calendar view", "Accrual & carryover rules"], accent: "border-amber-500/40 hover:border-amber-500" },
  { icon: FileText, title: "Documents & Compliance", tagline: "Every record secured and searchable.", features: ["Central document vault", "Expiry tracking", "Self-service uploads", "Compliance reports"], accent: "border-violet-500/40 hover:border-violet-500" },
  { icon: LayoutDashboard, title: "Dashboards & Reports", tagline: "Real-time insights at one glance.", features: ["Executive overview", "Department analytics", "Leave utilization reports", "Custom date filtering"], accent: "border-rose-500/40 hover:border-rose-500" },
  { icon: ShieldCheck, title: "Security & Governance", tagline: "Zero-trust by design.", features: ["Granular RBAC", "SoD enforcement", "Immutable audit trail", "SSO + step-up MFA"], accent: "border-cyan-500/40 hover:border-cyan-500" },
];

export function FeatureGridSection() {
  return (
    <section id="modules" className="py-20 lg:py-28 border-b border-border/60 bg-muted/10">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">Core Modules</span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">Six Unified Modules</h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">Every module is deeply integrated. Changes propagate instantly across the entire platform.</p>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureModules.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.title} className={cn("group rounded-2xl border-2 bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg", m.accent)}>
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-110"><Icon className="size-6" /></div>
                <h3 className="mt-5 font-heading text-xl font-bold text-foreground">{m.title}</h3>
                <p className="mt-1 text-xs font-semibold text-primary italic">{m.tagline}</p>
                <ul className="mt-4 space-y-2">
                  {m.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ─── Feature Comparison ─── */
const comparisonRows = [
  { feature: "Multi-Tenant Architecture", workforce: true, legacy: false },
  { feature: "Server-Authoritative Timesheets", workforce: true, legacy: false },
  { feature: "Real-Time Overlap Prevention", workforce: true, legacy: false },
  { feature: "SSO (Google + Microsoft Entra)", workforce: true, legacy: false },
  { feature: "Segregation of Duties (SoD)", workforce: true, legacy: false },
  { feature: "Immutable Cryptographic Audit", workforce: true, legacy: false },
  { feature: "Multi-Currency Payroll Hooks", workforce: true, legacy: false },
  { feature: "Zero-Downtime Deployments", workforce: true, legacy: false },
  { feature: "Open API / Service Accounts", workforce: true, legacy: true },
  { feature: "Mobile Employee Portal", workforce: true, legacy: true },
];

export function FeatureComparisonSection() {
  return (
    <section className="py-20 lg:py-28 border-b border-border/60">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">Comparison</span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">Why Workforce ERP Wins</h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">See how we stack up against traditional fragmented point solutions.</p>
        </div>

        <div className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-2xl border border-border shadow-sm">
          <div className="grid grid-cols-[1fr_auto_auto] bg-muted/60 px-6 py-3 text-xs font-semibold">
            <span>Capability</span>
            <span className="w-28 text-center text-primary">Workforce ERP</span>
            <span className="w-28 text-center text-muted-foreground">Legacy Tools</span>
          </div>
          {comparisonRows.map((row) => (
            <div key={row.feature} className="grid grid-cols-[1fr_auto_auto] border-t border-border px-6 py-3 text-sm transition hover:bg-muted/30">
              <span className="font-medium text-foreground">{row.feature}</span>
              <span className="flex w-28 items-center justify-center">
                {row.workforce ? <CheckCircle2 className="size-4 text-emerald-500" /> : <span className="size-4 rounded-full border border-border" />}
              </span>
              <span className="flex w-28 items-center justify-center">
                {row.legacy ? <CheckCircle2 className="size-4 text-muted-foreground/50" /> : <span className="size-4 rounded-full border border-border" />}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ─── Workflow ─── */
const workflowSteps = [
  { num: "01", title: "Onboard", desc: "Invite employees via email, complete profiles, assign branches and departments.", icon: Users },
  { num: "02", title: "Operate", desc: "Track attendance in real-time, manage leave, store documents centrally.", icon: Clock },
  { num: "03", title: "Automate", desc: "Approval chains, notifications, and policy enforcement run automatically.", icon: Workflow },
  { num: "04", title: "Analyze", desc: "Review dashboards, generate reports, and surface insights for leadership.", icon: BarChart3 },
];

export function WorkflowSection() {
  return (
    <section className="py-20 lg:py-28 border-b border-border/60 bg-muted/10">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">How It Works</span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">Four Steps to Operational Excellence</h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">Get your entire workforce management running in days, not months.</p>
        </div>
        <div className="relative mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {workflowSteps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.num} className="relative text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                  <Icon className="size-7" />
                </div>
                <span className="mt-4 block font-mono text-xs font-bold text-primary/60">Step {s.num}</span>
                <h3 className="mt-1 font-heading text-lg font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                {i < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-8 text-primary/30">
                    <ArrowRight className="size-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ─── FAQ ─── */
const faqs = [
  { q: "How long does implementation take?", a: "Most organizations are fully operational within 1–2 weeks. We handle data migration, SSO configuration, and team onboarding as part of every deployment." },
  { q: "Does Workforce ERP support multi-company structures?", a: "Yes. The platform supports unlimited companies (branches), each with independent department trees, designation hierarchies, and policy configurations under a single tenant." },
  { q: "How does the timesheet system prevent disputes?", a: "Clock-in and clock-out timestamps are server-authoritative—the system rejects client-supplied timestamps. Overlap detection runs in real-time, and managers use dedicated correction endpoints for adjustments." },
  { q: "What authentication methods are supported?", a: "Password, Google SSO, and Microsoft Entra SSO are primary methods. Authenticator App (TOTP), Email Code, and SMS Code are available for step-up verification of sensitive operations." },
  { q: "Is our data isolated from other tenants?", a: "Absolutely. Every organization operates within strict multi-tenant isolation. Tenant-aware middleware verifies active membership, roles, permissions, and data scopes on every request." },
  { q: "Can we integrate with existing payroll or HRIS systems?", a: "Yes. Service accounts with scoped bearer tokens enable secure server-to-server integrations. The API follows a versioned JSON envelope contract with full documentation." },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-20 lg:py-28 border-b border-border/60">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">FAQ</span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">Frequently Asked Questions</h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">Everything you need to know about Workforce ERP before getting started.</p>
        </div>
        <div className="mx-auto mt-14 max-w-3xl divide-y divide-border rounded-2xl border border-border shadow-sm">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold text-foreground transition hover:bg-muted/30"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{faq.q}</span>
                <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open === i && "rotate-180")} />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-top-1">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ─── CTA ─── */
export function FeaturesCallToActionSection() {
  return (
    <section className="py-20 lg:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/10 p-8 shadow-xl sm:p-12 lg:p-16">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 -z-10 size-80 rounded-full bg-primary/20 blur-3xl" />
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Zap className="size-3.5" />
              Get Started Today
            </div>
            <h2 className="mt-5 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Ready to Unify Your Workforce Operations?
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Replace fragmented tools with one powerful operating system. Set up in minutes, scale to thousands.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href="/erp/sign-up" className={cn(buttonVariants({ size: "lg" }), "h-12 w-full px-8 text-base font-semibold shadow-md sm:w-auto")}>
                Start Free Trial<ArrowRight className="ml-2 size-4" />
              </a>
              <Link to={WEB_PATHS.contact} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 w-full px-8 text-base font-semibold sm:w-auto")}>
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ─── Detail-page stubs (kept for route compatibility) ─── */
export function FeatureDetailsHeroSection() { return null; }
export function FeatureOverviewSection() { return null; }
export function FeatureCapabilitiesSection() { return null; }
export function FeatureBenefitsSection() { return null; }
export function FeatureUseCasesSection() { return null; }
