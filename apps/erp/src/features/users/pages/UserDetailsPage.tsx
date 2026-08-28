import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { ErpPage, SectionCard, StatCard, StatusPill } from "#components/erp/ErpPage";
import { tenantRoutes } from "#routes/paths";

export default function UserDetailsPage() {
  const { tenantKey = "", userId = "USR-001" } = useParams();

  // In production, resolves via useUser(userId)
  const user = {
    id: userId,
    name: "Sihab Hasan",
    email: "sihabsiuuu@gmail.com",
    role: "Owner",
    status: "active" as const,
    mfa_enabled: true,
    created_at: "2024-01-01",
    last_login_at: "2026-08-28 05:45 AM",
    linked_employee: "Sihab Hasan (EMP-001)",
  };

  const backUrl = tenantRoutes.users(tenantKey);

  return (
    <ErpPage
      title={user.name}
      description={`${user.email} · System ${user.role}`}
      actions={
        <Button variant="outline" nativeButton={false} render={<Link to={backUrl} />}>
          <ArrowLeft />
          Back to users
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Account status" value={<StatusPill value={user.status} />} />
        <StatCard
          label="Primary role"
          value={<span className="text-base font-semibold">{user.role}</span>}
        />
        <StatCard
          label="MFA protection"
          value={
            <span className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
              {user.mfa_enabled ? "Enabled (TOTP)" : "Disabled"}
            </span>
          }
        />
        <StatCard label="Joined on" value={<span className="text-base">{user.created_at}</span>} />
      </div>

      <SectionCard title="Account details" description="Identity and access configuration">
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">User ID</dt>
            <dd className="mt-1 font-mono text-sm">{user.id}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Work email</dt>
            <dd className="mt-1 text-sm font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Assigned role</dt>
            <dd className="mt-1 text-sm">{user.role}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Linked employee
            </dt>
            <dd className="mt-1 text-sm">{user.linked_employee}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Last session</dt>
            <dd className="mt-1 text-sm text-muted-foreground">{user.last_login_at}</dd>
          </div>
        </dl>
      </SectionCard>
    </ErpPage>
  );
}
