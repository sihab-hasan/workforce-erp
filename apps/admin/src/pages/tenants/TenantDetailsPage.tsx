import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  Edit,
  Users,
  Briefcase,
  Layers,
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  CreditCard,
  ShieldCheck,
  Power,
  Trash2,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
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
import { ADMIN_PATHS, adminTenantEditPath } from "#routes/paths";
import { useTenant } from "#features/tenants/hooks/use-tenant";
import {
  useActivateTenantMutation,
  useSuspendTenantMutation,
  useDeleteTenantMutation,
} from "#features/tenants/api/tenants.mutations";
import { TenantStatusDialog } from "#features/tenants/components/TenantStatusDialog";
import type { TenantSummary } from "#features/tenants/types/tenants.types";

export function TenantDetailsPage() {
  const { tenantId, organizationId } = useParams<{ tenantId?: string; organizationId?: string }>();
  const id = tenantId || organizationId || "";
  const navigate = useNavigate();

  const { data: res, isLoading, isError, refetch } = useTenant(id);
  const tenant = res?.data;

  const activateMutation = useActivateTenantMutation();
  const suspendMutation = useSuspendTenantMutation();
  const deleteMutation = useDeleteTenantMutation();

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    tenant: TenantSummary | null;
    action: "activate" | "suspend" | "delete" | null;
  }>({
    open: false,
    tenant: null,
    action: null,
  });

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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 rounded-xl lg:col-span-2" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !tenant) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-xl border border-border/80 bg-card/60 p-8 text-center">
        <AlertTriangle className="mb-3 size-10 text-destructive" />
        <h2 className="text-lg font-bold text-foreground">Failed to Load Tenant Details</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          The requested organization could not be retrieved. It may have been deleted or the ID is
          invalid.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Button variant="outline" size="sm" render={<Link to={ADMIN_PATHS.tenants} />}>
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

  const handleConfirmAction = async () => {
    if (!dialogState.tenant || !dialogState.action) return;

    if (dialogState.action === "activate") {
      await activateMutation.mutateAsync(dialogState.tenant.id);
      void refetch();
    } else if (dialogState.action === "suspend") {
      await suspendMutation.mutateAsync(dialogState.tenant.id);
      void refetch();
    } else if (dialogState.action === "delete") {
      await deleteMutation.mutateAsync(dialogState.tenant.id);
      navigate(ADMIN_PATHS.tenants);
    }
  };

  const isActionLoading =
    activateMutation.isPending || suspendMutation.isPending || deleteMutation.isPending;

  const planVariant =
    tenant.plan === "enterprise" ? "default" : tenant.plan === "business" ? "secondary" : "outline";

  const statusVariant =
    tenant.status === "active"
      ? "outline"
      : tenant.status === "suspended"
        ? "destructive"
        : "secondary";

  const appUrl = tenant.subdomain
    ? `https://${tenant.subdomain}.workforce.app`
    : `https://app.workforce.com/${tenant.slug}`;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20 md:pb-8">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card/70 p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            render={<Link to={ADMIN_PATHS.tenants} />}
            className="size-9 rounded-lg"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Building2 className="size-5 text-primary" />
              <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {tenant.name}
              </h1>
              <Badge
                variant={statusVariant}
                className="uppercase font-mono text-[10px] tracking-wider"
              >
                {tenant.status}
              </Badge>
              <Badge variant={planVariant} className="capitalize font-medium text-xs">
                {tenant.plan} Plan
              </Badge>
            </div>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              ID: {tenant.id} &bull; Slug: /{tenant.slug}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link to={adminTenantEditPath(tenant.id)} />}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <Edit className="size-3.5" />
            <span>Edit Profile</span>
          </Button>

          {tenant.status === "active" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setDialogState({
                  open: true,
                  tenant,
                  action: "suspend",
                })
              }
              className="h-9 gap-1.5 border-amber-500/30 text-xs font-semibold text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-400"
            >
              <Power className="size-3.5" />
              <span>Suspend</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setDialogState({
                  open: true,
                  tenant,
                  action: "activate",
                })
              }
              className="h-9 gap-1.5 border-emerald-500/30 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
            >
              <Power className="size-3.5" />
              <span>Activate</span>
            </Button>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={() =>
              setDialogState({
                open: true,
                tenant,
                action: "delete",
              })
            }
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <Trash2 className="size-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* ── Key Metrics Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl border border-border/70 bg-card/70 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Workspace Members</p>
              <p className="text-xl font-bold tracking-tight text-foreground">
                {tenant.members_count ?? tenant.members?.length ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-xl border border-border/70 bg-card/70 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Briefcase className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Employees</p>
              <p className="text-xl font-bold tracking-tight text-foreground">
                {tenant.employees_count ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-xl border border-border/70 bg-card/70 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Layers className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Departments</p>
              <p className="text-xl font-bold tracking-tight text-foreground">
                {tenant.departments_count ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-xl border border-border/70 bg-card/70 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <MapPin className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Office Branches</p>
              <p className="text-xl font-bold tracking-tight text-foreground">
                {tenant.branches_count ?? 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Main Details Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 spans): Primary Profile & Subscription */}
        <div className="space-y-6 lg:col-span-2">
          {/* Organization Information */}
          <Card className="rounded-xl border border-border/70 bg-card/70 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                <CardTitle className="text-base font-bold">Organization Profile</CardTitle>
              </div>
              <CardDescription className="text-xs">
                General company identity, contact records, and regional localization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-xs text-muted-foreground">Legal Registered Name</span>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    {tenant.legal_name || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Workspace Subdomain</span>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="font-mono text-sm font-semibold text-foreground">
                      {tenant.subdomain ? `${tenant.subdomain}.workforce.app` : "—"}
                    </p>
                    {tenant.subdomain ? (
                      <a
                        href={appUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    ) : null}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Primary Contact Email</span>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Mail className="size-3.5 text-muted-foreground" />
                    {tenant.email || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Primary Phone</span>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Phone className="size-3.5 text-muted-foreground" />
                    {tenant.phone || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Country / Region</span>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Globe className="size-3.5 text-muted-foreground" />
                    {tenant.country || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Base Currency & Timezone</span>
                  <p className="mt-0.5 font-mono text-xs font-semibold text-foreground">
                    {tenant.currency || "USD"} &bull; {tenant.timezone || "UTC"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription & Tier Information */}
          <Card className="rounded-xl border border-border/70 bg-card/70 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                <CardTitle className="text-base font-bold">Subscription & Licensing</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Platform contract status, tier features, and renewal schedule.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-xs text-muted-foreground">Current Plan</span>
                  <p className="mt-0.5 text-sm font-bold uppercase tracking-wide text-foreground">
                    {tenant.plan}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Subscription Status</span>
                  <p className="mt-0.5 text-sm font-medium capitalize text-foreground">
                    {tenant.subscription_status || tenant.status}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Subscription Started</span>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-foreground">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    {tenant.subscription_started_at
                      ? new Date(tenant.subscription_started_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Subscription Renewal/End</span>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-foreground">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    {tenant.subscription_ends_at
                      ? new Date(tenant.subscription_ends_at).toLocaleDateString()
                      : "Open / Monthly Auto-renew"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 span): Administrative Personnel & Metadata */}
        <div className="space-y-6">
          {/* Workspace Administrators */}
          <Card className="rounded-xl border border-border/70 bg-card/70 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <CardTitle className="text-base font-bold">Workspace Leadership</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Designated organization owners and administrative users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {tenant.members && tenant.members.length > 0 ? (
                tenant.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-3"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                    <Badge variant="secondary" className="capitalize text-[10px]">
                      {member.pivot?.role?.replace(/_/g, " ") || "Member"}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border/80 p-4 text-center text-xs text-muted-foreground">
                  No linked platform owner account found.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit & Timestamps */}
          <Card className="rounded-xl border border-border/70 bg-card/70 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Audit Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Provisioned On</span>
                <span className="font-mono font-medium text-foreground">
                  {new Date(tenant.created_at).toLocaleString()}
                </span>
              </div>
              {tenant.updated_at ? (
                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground">Last Modified</span>
                  <span className="font-mono font-medium text-foreground">
                    {new Date(tenant.updated_at).toLocaleString()}
                  </span>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Status Confirmation Dialog ───────────────────────────────────────── */}
      <TenantStatusDialog
        open={dialogState.open}
        tenant={dialogState.tenant}
        action={dialogState.action}
        loading={isActionLoading}
        onOpenChange={(open) => {
          if (!open) {
            setDialogState({ open: false, tenant: null, action: null });
          }
        }}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}

export default TenantDetailsPage;
