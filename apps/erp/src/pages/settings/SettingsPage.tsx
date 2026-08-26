import { KeyRound, MonitorSmartphone, ShieldCheck, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ERP_PATHS, tenantRoutes } from "#routes/paths";

const items = [
  {
    key: "profile",
    label: "My profile",
    description: "Review and update your account profile.",
    icon: UserRound,
  },
  {
    key: "security",
    label: "Account security",
    description: "Change your password and protect account access.",
    icon: KeyRound,
  },
  {
    key: "sessions",
    label: "Active sessions",
    description: "Review and revoke active browser sessions.",
    icon: ShieldCheck,
  },
  {
    key: "devices",
    label: "Devices",
    description: "Review devices associated with your account.",
    icon: MonitorSmartphone,
  },
] as const;

export function SettingsPage() {
  const { tenantKey } = useParams();
  const base = tenantKey ? tenantRoutes.settings(tenantKey) : ERP_PATHS.tenantSelect;

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and workspace settings.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map(({ key, label, description, icon: Icon }) => (
          <Link
            key={key}
            to={`${base}/${key}`}
            className="group rounded-xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold group-hover:text-primary">{label}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default SettingsPage;
