import { useCompanyAbout } from "../hooks/use-company";
import { CompanyHeroSection as HeroSectionComponent } from "./CompanyHeroSection";
import { CompanyStatsSection as StatsSectionComponent } from "./CompanyStatsSection";
import { CompanyStorySection as StorySectionComponent } from "./CompanyStorySection";
import { ValuesSection as ValuesSectionComponent } from "./ValuesSection";
import { CompanyTimeline as TimelineComponent } from "./CompanyTimeline";
import { LeadershipSection as LeadershipComponent } from "./LeadershipSection";
import { GlobalOfficesSection as GlobalOfficesComponent } from "./GlobalOfficesSection";
import { BenefitsSection as BenefitsComponent } from "./BenefitsSection";
import { CompanyCallToActionSection as CallToActionComponent } from "./CompanyCallToActionSection";
import { Container } from "#layouts/Container";
import { Briefcase, Handshake } from "lucide-react";
import { Link } from "react-router-dom";
import { WEB_PATHS } from "#routes/paths";
import { buttonVariants } from "@workforce-erp/ui/components/button";
import { cn } from "@workforce-erp/ui/lib/utils";
import type {
  CompanyInfo,
  CompanyStat,
  CompanyStory,
  CompanyValue,
  TimelineMilestone,
  LeadershipMember,
  CompanyOffice,
  CompanyBenefit,
} from "../types/company.types";

export function CompanyHeroSection({
  company,
  className,
}: {
  company?: CompanyInfo;
  className?: string;
}) {
  const { data } = useCompanyAbout();
  return <HeroSectionComponent company={company || data.company} className={className} />;
}

export function CompanyStatsSection({
  stats,
  className,
}: {
  stats?: CompanyStat[];
  className?: string;
}) {
  const { data } = useCompanyAbout();
  return <StatsSectionComponent stats={stats || data.stats} className={className} />;
}

export function CompanyStorySection({
  story,
  className,
}: {
  story?: CompanyStory;
  className?: string;
}) {
  const { data } = useCompanyAbout();
  return <StorySectionComponent story={story || data.story} className={className} />;
}

export function TimelineSection({
  timeline,
  className,
}: {
  timeline?: TimelineMilestone[];
  className?: string;
}) {
  const { data } = useCompanyAbout();
  return <TimelineComponent timeline={timeline || data.timeline} className={className} />;
}

export function LeadershipSectionBlock({
  leadership,
  className,
}: {
  leadership?: LeadershipMember[];
  className?: string;
}) {
  const { data } = useCompanyAbout();
  return <LeadershipComponent leadership={leadership || data.leadership} className={className} />;
}

export function ValuesSection({
  values,
  className,
}: {
  values?: CompanyValue[];
  className?: string;
}) {
  const { data } = useCompanyAbout();
  return <ValuesSectionComponent values={values || data.values} className={className} />;
}

export function GlobalOfficesSection({
  offices,
  className,
}: {
  offices?: CompanyOffice[];
  className?: string;
}) {
  const { data } = useCompanyAbout();
  return <GlobalOfficesComponent offices={offices || data.offices} className={className} />;
}

export function BenefitsSection({
  benefits,
  className,
}: {
  benefits?: CompanyBenefit[];
  className?: string;
}) {
  const { data } = useCompanyAbout();
  return <BenefitsComponent benefits={benefits || data.benefits} className={className} />;
}

export function CompanyCallToActionSection({ className }: { className?: string }) {
  return <CallToActionComponent className={className} />;
}

export function OpenRolesSection({ className }: { className?: string }) {
  const roles = [
    {
      title: "Senior Distributed Systems Engineer",
      dept: "Engineering",
      loc: "Remote / US / EMEA",
      type: "Full-time",
    },
    {
      title: "Principal Product Designer (Design Systems)",
      dept: "Product",
      loc: "Remote / Global",
      type: "Full-time",
    },
    {
      title: "Enterprise Solutions Architect",
      dept: "Solutions",
      loc: "London / Hybrid",
      type: "Full-time",
    },
    {
      title: "Senior Security & Compliance Engineer",
      dept: "Security",
      loc: "San Francisco / Remote",
      type: "Full-time",
    },
  ];

  return (
    <section className={cn("py-16 border-b border-border/60", className)}>
      <Container>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Briefcase className="size-5" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground">
              Featured Open Positions
            </h2>
            <p className="text-xs text-muted-foreground">
              Join our high-velocity team building the future of workforce management
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {roles.map((role) => (
            <div
              key={role.title}
              className="flex flex-col justify-between rounded-xl border border-border/70 bg-card p-5 transition hover:border-primary/40 hover:shadow-xs"
            >
              <div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                  {role.dept}
                </span>
                <h3 className="mt-2 text-base font-bold text-foreground">{role.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {role.loc} · {role.type}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 flex justify-end">
                <Link
                  to={WEB_PATHS.contact}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function HiringProcessSection({ className }: { className?: string }) {
  const steps = [
    {
      num: "01",
      title: "Intro Conversation",
      desc: "A 30-min chat to explore mutual alignment, values, and shared goals.",
    },
    {
      num: "02",
      title: "Technical / Domain Deep Dive",
      desc: "A practical, respectful assessment of architecture, craft, and execution.",
    },
    {
      num: "03",
      title: "Team Collaboration",
      desc: "Meet your future peers, ask honest questions, and evaluate culture fit.",
    },
    {
      num: "04",
      title: "Transparent Offer",
      desc: "Clear equity, comprehensive benefits, and competitive compensation packages.",
    },
  ];

  return (
    <section className={cn("py-16 border-b border-border/60 bg-muted/10", className)}>
      <Container>
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Our Transparent Hiring Philosophy
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            We respect your time with a structured, feedback-driven 4-stage process.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.num} className="rounded-xl border border-border/70 bg-card p-5">
              <span className="font-mono text-2xl font-extrabold text-primary">{s.num}</span>
              <h3 className="mt-2 text-sm font-bold text-foreground">{s.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function PartnerNetworkSection({ className }: { className?: string }) {
  return (
    <section className={cn("py-16 border-b border-border/60", className)}>
      <Container>
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center max-w-2xl mx-auto">
          <Handshake className="size-8 text-primary mx-auto mb-3" />
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Workforce Global Partner Ecosystem
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            We collaborate with premier HR consultancies, system integrators, and technology
            alliances worldwide.
          </p>
          <div className="mt-6">
            <Link
              to={WEB_PATHS.contact}
              className={cn(buttonVariants({ size: "default" }), "font-semibold")}
            >
              Become an Alliance Partner
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function PartnerBenefitsSection({ className: _className }: { className?: string } = {}) {
  return null;
}

export function PartnerProgramsSection({ className: _className }: { className?: string } = {}) {
  return null;
}
