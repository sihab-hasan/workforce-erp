import { useEffect, useState } from "react";
import { Building2, Clock, MapPin } from "lucide-react";
import { Container } from "#layouts/Container";
import { cn } from "@workforce-erp/ui/lib/utils";
import type { CompanyOffice } from "../types/company.types";

interface GlobalOfficesSectionProps {
  offices: CompanyOffice[];
  className?: string | undefined;
}

const timezoneMap: Record<string, string> = {
  "San Francisco": "America/Los_Angeles",
  London: "Europe/London",
  Dhaka: "Asia/Dhaka",
  Singapore: "Asia/Singapore",
};

export function GlobalOfficesSection({ offices, className }: GlobalOfficesSectionProps) {
  const [currentTimes, setCurrentTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    function updateClocks() {
      const now = new Date();
      const updated: Record<string, string> = {};

      offices.forEach((office) => {
        const timeZone = timezoneMap[office.city] || "UTC";
        try {
          updated[office.city] = new Intl.DateTimeFormat("en-US", {
            timeZone,
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }).format(now);
        } catch {
          updated[office.city] = "—";
        }
      });

      setCurrentTimes(updated);
    }

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, [offices]);

  return (
    <section id="offices" className={cn("py-20 lg:py-28 border-b border-border/60", className)}>
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            Worldwide Footprint
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Global Engineering & Operations Hubs
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Strategically located across four timezones to deliver 24/7 reliability, fast customer
            onboarding, and continuous development velocity.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {offices.map((office) => (
            <div
              key={office.city}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="size-5" />
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {office.tag}
                  </span>
                </div>

                <div className="mt-5">
                  <h3 className="font-heading text-xl font-bold text-foreground">{office.city}</h3>
                  <p className="text-xs font-semibold text-primary">{office.country}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{office.type}</p>
                </div>

                <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-4 shrink-0 text-primary/70 mt-0.5" />
                  <span>{office.address}</span>
                </div>
              </div>

              {/* Live Timezone Clock */}
              <div className="mt-6 pt-4 border-t border-border/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="size-3.5 text-primary" />
                    <span>Local Time</span>
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {currentTimes[office.city] || office.timezone}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
