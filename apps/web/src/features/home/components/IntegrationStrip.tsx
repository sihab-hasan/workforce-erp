import { ArrowRight, Asterisk, Sun } from "lucide-react";
import { type ComponentType, useRef } from "react";
import { Link } from "react-router-dom";

import { siteRoutes } from "#config/site-map";
import { Container } from "#layouts/Container";
import { cn } from "@workforce-erp/ui/lib/utils";
import {
  bindScrollAnimation,
  gsap,
  motionDistance,
  motionDuration,
  motionEase,
  motionStagger,
  prefersReducedMotion,
  useGSAP,
} from "@workforce-erp/ui/motion";

export interface IntegrationStripProps {
  className?: string;
}

interface Integration {
  mark: ComponentType;
  name: string;
}

const integrations: Integration[] = [
  { mark: TeamsMark, name: "Microsoft Teams" },
  { mark: SlackMark, name: "Slack" },
  { mark: GoogleWorkspaceMark, name: "Google Workspace" },
  { mark: QuickBooksMark, name: "QuickBooks" },
  { mark: XeroMark, name: "Xero" },
  { mark: StripeMark, name: "Stripe" },
  { mark: ZapierMark, name: "Zapier" },
  { mark: OktaMark, name: "Okta" },
];

export function IntegrationStrip({ className }: IntegrationStripProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const animatedElements = [
        "[data-integrations-heading]",
        "[data-integrations-copy]",
        "[data-integrations-action]",
        "[data-integrations-band]",
        "[data-integrations-group]",
        "[data-integrations-hub]",
      ];

      if (prefersReducedMotion()) {
        gsap.set(animatedElements, { clearProps: "all" });
        return;
      }

      const timeline = gsap.timeline({
        defaults: { ease: motionEase.enter },
        paused: true,
      });

      timeline
        .from("[data-integrations-heading]", {
          autoAlpha: 0,
          duration: motionDuration.slow,
          y: motionDistance.medium,
        })
        .from(
          ["[data-integrations-copy]", "[data-integrations-action]"],
          {
            autoAlpha: 0,
            duration: motionDuration.normal,
            stagger: motionStagger.normal,
            y: motionDistance.small,
          },
          "-=0.42",
        )
        .from(
          "[data-integrations-band]",
          {
            autoAlpha: 0,
            duration: motionDuration.slow,
            scaleX: 0.97,
            transformOrigin: "center",
            y: motionDistance.medium,
          },
          "-=0.18",
        )
        .from(
          "[data-integrations-group]",
          {
            autoAlpha: 0,
            duration: motionDuration.slow,
            stagger: motionStagger.fast,
            x: motionDistance.large,
          },
          "-=0.48",
        )
        .from(
          "[data-integrations-hub]",
          {
            autoAlpha: 0,
            duration: motionDuration.normal,
            ease: "back.out(1.7)",
            scale: 0.84,
          },
          "-=0.45",
        );

      if (sectionRef.current) {
        bindScrollAnimation(timeline, {
          once: false,
          start: "top 82%",
          trigger: sectionRef.current,
        });
      }
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="integrations-heading"
      className={cn("overflow-hidden bg-background py-20 sm:py-24 lg:py-28", className)}
    >
      <Container>
        <header className="grid items-end gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.65fr)] lg:gap-16">
          <h2
            id="integrations-heading"
            data-integrations-heading
            className="max-w-4xl font-heading text-[clamp(3.25rem,5.6vw,5.5rem)] leading-[0.98] font-bold tracking-[-0.065em] text-balance"
          >
            Your tools, already in sync.
          </h2>

          <div className="max-w-xl lg:justify-self-end">
            <p
              data-integrations-copy
              className="text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9"
            >
              Connect Workforce ERP with the platforms your teams use every day—without rebuilding
              the way they work.
            </p>
            <Link
              data-integrations-action
              to={siteRoutes.integrations.path}
              className="group/action mt-7 inline-flex items-center gap-3 border-b border-primary pb-1 font-heading text-lg font-bold text-primary transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Explore integrations
              <ArrowRight
                aria-hidden="true"
                className="size-5 transition-transform duration-300 group-hover/action:translate-x-1"
              />
            </Link>
          </div>
        </header>
      </Container>

      <div
        data-integrations-band
        className="relative isolate mt-14 bg-primary/5 py-8 sm:mt-16 sm:py-10"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-primary/35"
        />

        <div
          aria-label="Connected platforms. Focus to pause the moving list."
          className="marketing-marquee relative z-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] px-4 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary sm:px-8"
          role="region"
          tabIndex={0}
        >
          <div className="marketing-marquee-track flex w-max">
            {[0, 1].map((groupIndex) => (
              <ul
                key={groupIndex}
                data-integrations-group
                aria-hidden={groupIndex === 1 ? true : undefined}
                className={cn(
                  "flex shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4",
                  groupIndex === 1 && "marketing-marquee-duplicate",
                )}
              >
                <li className="flex h-32 w-44 shrink-0 items-center justify-center rounded-xl bg-primary px-5 text-center text-primary-foreground shadow-lg lg:hidden">
                  <span>
                    <span className="block font-heading text-4xl font-extrabold">W</span>
                    <span className="mt-2 block text-sm font-bold">Workforce ERP</span>
                  </span>
                </li>

                {integrations.map((integration) => (
                  <IntegrationTile
                    key={`${groupIndex}-${integration.name}`}
                    integration={integration}
                  />
                ))}
              </ul>
            ))}
          </div>
        </div>

        <div
          data-integrations-hub
          className="absolute top-1/2 left-1/2 z-20 hidden h-36 w-48 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-primary px-5 text-center text-primary-foreground shadow-[0_24px_48px_-22px_oklch(0.35_0.1_165_/_0.6)] lg:flex"
        >
          <span>
            <span className="block font-heading text-5xl leading-none font-extrabold">W</span>
            <span className="mt-3 block text-base font-bold">Workforce ERP</span>
          </span>
        </div>
      </div>
    </section>
  );
}

function IntegrationTile({ integration }: { integration: Integration }) {
  const Mark = integration.mark;

  return (
    <li className="flex h-32 w-44 shrink-0 flex-col items-center justify-center rounded-xl border border-border/90 bg-card px-5 text-center shadow-sm">
      <Mark />
      <span className="mt-4 text-sm leading-5 font-semibold text-card-foreground">
        {integration.name}
      </span>
    </li>
  );
}

function TeamsMark() {
  return (
    <span aria-hidden="true" className="relative flex h-10 w-12 items-center justify-center">
      <span className="flex size-9 items-center justify-center rounded-lg bg-[#6264a7] font-heading text-xl font-extrabold text-white">
        T
      </span>
      <span className="absolute top-0 right-0 size-3 rounded-full bg-[#8b8cc7] ring-2 ring-card" />
      <span className="absolute right-0 bottom-1 size-4 rounded-full bg-[#7b7dc2] ring-2 ring-card" />
    </span>
  );
}

function SlackMark() {
  return (
    <svg aria-hidden="true" className="size-10" viewBox="0 0 48 48" fill="none">
      <rect x="19" y="2" width="8" height="20" rx="4" fill="#36C5F0" />
      <rect x="26" y="19" width="20" height="8" rx="4" fill="#2EB67D" />
      <rect x="21" y="26" width="8" height="20" rx="4" fill="#ECB22E" />
      <rect x="2" y="21" width="20" height="8" rx="4" fill="#E01E5A" />
      <circle cx="13" cy="13" r="4" fill="#36C5F0" />
      <circle cx="35" cy="13" r="4" fill="#2EB67D" />
      <circle cx="35" cy="35" r="4" fill="#ECB22E" />
      <circle cx="13" cy="35" r="4" fill="#E01E5A" />
    </svg>
  );
}

function GoogleWorkspaceMark() {
  return (
    <span
      aria-hidden="true"
      className="relative font-heading text-4xl leading-none font-extrabold text-[#4285f4]"
    >
      G
      <span className="absolute -right-1 bottom-0 h-1 w-3 bg-[#34a853]" />
      <span className="absolute -right-1 bottom-2 h-1 w-3 bg-[#fbbc05]" />
      <span className="absolute -right-1 bottom-4 h-1 w-3 bg-[#ea4335]" />
    </span>
  );
}

function QuickBooksMark() {
  return (
    <span
      aria-hidden="true"
      className="flex size-10 items-center justify-center rounded-full bg-[#2ca01c] text-sm font-bold tracking-[-0.08em] text-white"
    >
      qb
    </span>
  );
}

function XeroMark() {
  return (
    <span
      aria-hidden="true"
      className="flex size-10 items-center justify-center rounded-full bg-[#13b5ea] text-[11px] font-semibold text-white"
    >
      xero
    </span>
  );
}

function StripeMark() {
  return (
    <span
      aria-hidden="true"
      className="font-heading text-4xl leading-none font-extrabold text-[#635bff]"
    >
      S
    </span>
  );
}

function ZapierMark() {
  return <Asterisk aria-hidden="true" className="size-10 text-[#ff4f00]" strokeWidth={4} />;
}

function OktaMark() {
  return <Sun aria-hidden="true" className="size-10 text-foreground" strokeWidth={3} />;
}
