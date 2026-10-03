import { useParams, Link } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  Edit,
  MapPin,
  Layers,
  Users,
  Briefcase,
  Globe,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Badge } from "@workforce-erp/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import { ADMIN_PATHS, adminOrganizationEditPath, adminTenantDetailsPath } from "#routes/paths";
import { useOrganization } from "#features/organizations/hooks/use-organization";
import { BranchListCard } from "#features/organizations/components/BranchListCard";
import { DepartmentListCard } from "#features/organizations/components/DepartmentListCard";
import { DesignationListCard } from "#features/organizations/components/DesignationListCard";

export function OrganizationDetailsPage() {
  const { organizationId, tenantId } = useParams<{ organizationId?: string; tenantId?: string }>();
  const id = organizationId || tenantId || "";

  const { data: res, isLoading, isError, refetch } = useOrganization(id);
  const organization = res?.data;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 pb-20 md:pb-8">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError || !organization) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-xl border border-border/80 bg-card/60 p-8 text-center">
        <AlertTriangle className="mb-3 size-10 text-destructive" />
        <h2 className="text-lg font-bold text-foreground">Organization Not Found</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          The requested organization profile could not be retrieved from the server.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Button variant="outline" size="sm" render={<Link to={ADMIN_PATHS.organizations} />}>
            <ArrowLeft className="mr-1.5 size-3.5" />
            Back to Directory
          </Button>
          <Button size="sm" onClick={() => void refetch()}>
            <RefreshCw className="mr-1.5 size-3.5" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20 md:pb-8">
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card/70 p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            render={<Link to={ADMIN_PATHS.organizations} />}
            className="size-9 rounded-lg"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Building2 className="size-5 text-primary" />
              <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {organization.name}
              </h1>
              <Badge variant="outline" className="font-mono text-xs capitalize">
                {organization.status}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              {organization.legal_name ? `${organization.legal_name} • ` : ""}
              {organization.country || "Global"} &bull; Base: {organization.currency || "USD"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link to={adminOrganizationEditPath(organization.id)} />}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <Edit className="size-3.5" />
            <span>Edit Corporate Profile</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            render={<Link to={adminTenantDetailsPath(organization.id)} />}
            className="h-9 text-xs text-muted-foreground hover:text-foreground"
          >
            <span>View SaaS Workspace</span>
          </Button>
        </div>
      </div>

      {/* ── Key Metrics Summary ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/70 p-4 shadow-xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <MapPin className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Office Branches</p>
            <p className="text-xl font-bold tracking-tight text-foreground">
              {organization.branches_count ?? organization.branches?.length ?? 0}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/70 p-4 shadow-xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Layers className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Departments</p>
            <p className="text-xl font-bold tracking-tight text-foreground">
              {organization.departments_count ?? organization.departments?.length ?? 0}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/70 p-4 shadow-xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Users className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Workforce</p>
            <p className="text-xl font-bold tracking-tight text-foreground">
              {organization.employees_count ?? 0} Employees
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/70 p-4 shadow-xs">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Briefcase className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Job Designations</p>
            <p className="text-xl font-bold tracking-tight text-foreground">
              {organization.designations?.length ?? 0} Titles
            </p>
          </div>
        </Card>
      </div>

      {/* ── Corporate Identity & Registered Info ─────────────────────────────── */}
      <Card className="rounded-xl border border-border/70 bg-card/70 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            <CardTitle className="text-base font-bold">Corporate Identity & Head Office</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Commercial registration, official headquarters location, and contact records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <span className="text-xs text-muted-foreground">Operating Name</span>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{organization.name}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Legal Registered Name</span>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {organization.legal_name || "—"}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Country & Region</span>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Globe className="size-3.5 text-muted-foreground" />
                {organization.country || "—"}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Headquarters Address</span>
              <p className="mt-0.5 flex items-start gap-1.5 text-xs text-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <span>{organization.address || "No physical address specified"}</span>
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Corporate Email</span>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Mail className="size-3.5 text-muted-foreground" />
                {organization.email || "—"}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Corporate Phone</span>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Phone className="size-3.5 text-muted-foreground" />
                {organization.phone || "—"}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Reporting Currency</span>
              <p className="mt-0.5 font-mono text-sm font-bold text-foreground">
                {organization.currency || "USD"}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Base Timezone</span>
              <p className="mt-0.5 font-mono text-xs text-foreground">
                {organization.timezone || "UTC"}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Fiscal Year Start</span>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-foreground">
                <Calendar className="size-3.5 text-muted-foreground" />
                Month {organization.fiscal_year_start_month || 1} (January)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Branches & Offices ───────────────────────────────────────────────── */}
      <BranchListCard branches={organization.branches} />

      {/* ── Departments & Operating Divisions ────────────────────────────────── */}
      <DepartmentListCard departments={organization.departments} />

      {/* ── Job Designations & Professional Roles ────────────────────────────── */}
      <DesignationListCard designations={organization.designations} />

      {/* ── Executive Leadership ─────────────────────────────────────────────── */}
      <Card className="rounded-xl border border-border/70 bg-card/70 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <CardTitle className="text-base font-bold">
              Executive Leadership & Key Contacts
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Designated corporate representatives and executive officers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {organization.members && organization.members.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {organization.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/50 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <Badge variant="secondary" className="capitalize text-[10px]">
                    {member.pivot?.role?.replace(/_/g, " ") || "Officer"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No leadership members associated with this organization.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default OrganizationDetailsPage;
