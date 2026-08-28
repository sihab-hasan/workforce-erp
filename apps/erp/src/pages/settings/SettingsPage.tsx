import {
  Building2,
  ChevronRight,
  KeyRound,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ErpPage, SectionCard, StatCard, StatusPill } from "#components/erp/ErpPage";
import { ERP_PATHS, tenantRoutes } from "#routes/paths";

interface SettingItem {
  key: string;
  label: string;
  description: string;
  icon: typeof UserRound;
  tag?: string;
}

const accountItems: SettingItem[] = [
  {
    key: "profile",
    label: "Personal Profile",
    description: "Update your full name, work email, phone number, and emergency contacts.",
    icon: UserRound,
  },
  {
    key: "security",
    label: "Account Security & 2FA",
    description: "Manage your password, setup authenticator apps (TOTP), and step-up verification.",
    icon: KeyRound,
    tag: "High Priority",
  },
];

const securityItems: SettingItem[] = [
  {
    key: "sessions",
    label: "Active Sessions",
    description: "Inspect live browser sessions, IP addresses, and revoke unknown devices.",
    icon: ShieldCheck,
  },
  {
    key: "devices",
    label: "Trusted Devices",
    description: "Review authorized workstations, mobile apps, and biometric hardware keys.",
    icon: Smartphone,
  },
  {
    key: "organization",
    label: "Organization Preferences",
    description: "Configure workspace parameters, business hours, and operational hierarchy.",
    icon: Building2,
  },
];

export function SettingsPage() {
  const { tenantKey } = useParams();
  const base = tenantKey ? tenantRoutes.settings(tenantKey) : ERP_PATHS.tenantSelect;

  return (
    <ErpPage
      title="Settings"
      description="Manage your workspace preferences, personal identity, security authenticators, and linked devices."
    >
      {/* Top Overview Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Account Status" value={<StatusPill value="active" />} />
        <StatCard label="Two-Factor Security" value={<StatusPill value="enabled" />} />
        <StatCard
          label="Session Security"
          value={<span className="text-base font-semibold">1 Active Session</span>}
        />
        <StatCard
          label="Access Level"
          value={<span className="text-base font-semibold">Full Workspace</span>}
        />
      </div>

      {/* Group 1: Identity & Credentials */}
      <SectionCard
        title="Personal & Identity"
        description="Your user credentials, personal attributes, and multi-factor authentication"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {accountItems.map(({ key, label, description, icon: Icon, tag }) => (
            <Link
              key={key}
              to={`${base}/${key}`}
              className="group flex items-start justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:bg-muted/30 hover:shadow-sm"
            >
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary">
                      {label}
                    </h3>
                    {tag && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        {tag}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </SectionCard>

      {/* Group 2: Devices & Workspace */}
      <SectionCard
        title="Access & Security Controls"
        description="Authorized devices, session tokens, and workspace governance"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {securityItems.map(({ key, label, description, icon: Icon }) => (
            <Link
              key={key}
              to={`${base}/${key}`}
              className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:bg-muted/30 hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary">
                    {label}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end text-xs font-medium text-primary">
                <span>Manage</span>
                <ChevronRight className="ml-1 size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
    </ErpPage>
  );
}

export default SettingsPage;
