import { useState } from "react";
import { Container } from "#layouts/Container";
import { cn } from "@workforce-erp/ui/lib/utils";
import type { LeadershipMember } from "../types/company.types";

export interface LeadershipSectionProps {
  leadership: LeadershipMember[];
  className?: string | undefined;
}

export function LeadershipSection({ leadership, className }: LeadershipSectionProps) {
  const [activeDept, setActiveDept] = useState<string>("All");

  const departments = [
    "All",
    ...Array.from(new Set(leadership.map((l) => l.department))),
  ];

  const filtered =
    activeDept === "All"
      ? leadership
      : leadership.filter((l) => l.department === activeDept);

  return (
    <section id="leadership" className={cn("py-20 lg:py-28 bg-muted/15 border-b border-border/60", className)}>
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            Leadership Team
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Led by Systems Builders & People Advocates
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Our team brings together deep expertise in cloud architectures, enterprise security, product design, and global workforce operations.
          </p>

          {/* Department Filter Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setActiveDept(dept)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200",
                  activeDept === dept
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Leadership Grid */}
        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((member) => (
            <div
              key={member.id}
              className="group overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-xs transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
            >
              {/* Photo & Role Header */}
              <div className="flex items-center gap-4">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="size-16 rounded-full object-cover border-2 border-primary/20 shadow-xs transition duration-300 group-hover:scale-105 group-hover:border-primary"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <h3 className="truncate font-heading text-lg font-bold text-foreground">
                    {member.name}
                  </h3>
                  <p className="truncate text-xs font-medium text-primary">
                    {member.role}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {member.department}
                  </span>
                </div>
              </div>

              {/* Bio */}
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {member.bio}
              </p>

              {/* Social Links */}
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border/40 text-muted-foreground">
                {member.socials.linkedin && (
                  <a
                    href={member.socials.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${member.name} LinkedIn profile`}
                    className="rounded-lg p-1.5 transition hover:bg-primary/10 hover:text-primary"
                  >
                    <svg className="size-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                  </a>
                )}
                {member.socials.github && (
                  <a
                    href={member.socials.github}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${member.name} GitHub profile`}
                    className="rounded-lg p-1.5 transition hover:bg-primary/10 hover:text-primary"
                  >
                    <svg className="size-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                    </svg>
                  </a>
                )}
                {member.socials.twitter && (
                  <a
                    href={member.socials.twitter}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${member.name} Twitter profile`}
                    className="rounded-lg p-1.5 transition hover:bg-primary/10 hover:text-primary"
                  >
                    <svg className="size-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
