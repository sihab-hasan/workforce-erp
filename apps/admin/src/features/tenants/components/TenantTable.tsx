import { useState } from "react";
import {
  MoreHorizontal,
  Eye,
  Edit,
  ShieldCheck,
  ShieldAlert,
  Building2,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Button } from "@workforce-erp/ui/components/button";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workforce-erp/ui/components/dropdown-menu";
import { adminTenantDetailsPath, adminTenantEditPath } from "#routes/paths";
import type { TenantSummary } from "../types/tenants.types";
import { TenantStatusDialog } from "./TenantStatusDialog";
import {
  useActivateTenantMutation,
  useSuspendTenantMutation,
  useDeleteTenantMutation,
} from "../api/tenants.mutations";

export interface TenantTableProps {
  tenants: TenantSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  isPending: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
  onRetry?: () => void;
}

export function TenantTable({
  tenants,
  page,
  pageSize,
  totalCount,
  isPending,
  isError,
  onPageChange,
  onRetry,
}: TenantTableProps) {
  const [targetTenant, setTargetTenant] = useState<TenantSummary | null>(null);
  const [dialogAction, setDialogAction] = useState<"activate" | "suspend" | "delete" | null>(null);

  const activateMutation = useActivateTenantMutation();
  const suspendMutation = useSuspendTenantMutation();
  const deleteMutation = useDeleteTenantMutation();

  const isMutating =
    activateMutation.isPending || suspendMutation.isPending || deleteMutation.isPending;

  const handleConfirmAction = async () => {
    if (!targetTenant || !dialogAction) return;
    try {
      if (dialogAction === "activate") {
        await activateMutation.mutateAsync(targetTenant.id);
      } else if (dialogAction === "suspend") {
        await suspendMutation.mutateAsync(targetTenant.id);
      } else if (dialogAction === "delete") {
        await deleteMutation.mutateAsync(targetTenant.id);
      }
      setDialogAction(null);
      setTargetTenant(null);
    } catch {
      // Handled by query mutation
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const getPlanBadge = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "enterprise":
        return (
          <Badge
            variant="outline"
            className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400"
          >
            Enterprise
          </Badge>
        );
      case "business":
      case "pro":
        return (
          <Badge
            variant="outline"
            className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
          >
            Pro Plan
          </Badge>
        );
      case "starter":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          >
            Starter
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          >
            Trial
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          >
            Active
          </Badge>
        );
      case "suspended":
        return (
          <Badge
            variant="outline"
            className="border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
          >
            Suspended
          </Badge>
        );
      case "trial":
        return (
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          >
            Trial
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-muted-foreground/30 bg-muted/40 text-muted-foreground"
          >
            Inactive
          </Badge>
        );
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <p className="font-semibold text-destructive">Failed to load tenant directory.</p>
        <p className="mt-1 text-xs text-destructive/80">Please verify API connection or reload.</p>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
            Try again
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card/70 shadow-xs backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/70 bg-muted/40 text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Tenant Organization</th>
                <th className="px-4 py-3 font-semibold">Subscription Plan</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Members</th>
                <th className="px-4 py-3 font-semibold text-center">Employees</th>
                <th className="px-4 py-3 font-semibold">Created Date</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isPending ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-9 rounded-lg" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="px-4 py-3.5">
                      <Skeleton className="h-5 w-16" />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Skeleton className="mx-auto h-4 w-8" />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Skeleton className="mx-auto h-4 w-8" />
                    </td>
                    <td className="px-4 py-3.5">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Skeleton className="ml-auto size-7 rounded-md" />
                    </td>
                  </tr>
                ))
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <Building2 className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                    <p className="font-semibold text-foreground">No tenant organizations found</p>
                    <p className="mt-0.5 text-xs">
                      Try adjusting search filters or create a new tenant.
                    </p>
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="group transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 font-bold text-primary">
                          {tenant.name[0]?.toUpperCase() || "T"}
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={adminTenantDetailsPath(tenant.id)}
                            className="font-semibold text-foreground hover:text-primary transition-colors truncate block"
                          >
                            {tenant.name}
                          </Link>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                            <span>/{tenant.slug}</span>
                            {tenant.subdomain ? (
                              <>
                                <span>·</span>
                                <span>{tenant.subdomain}.workforce.app</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">{getPlanBadge(tenant.plan)}</td>

                    <td className="px-4 py-3.5">{getStatusBadge(tenant.status)}</td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="font-semibold text-foreground">
                        {tenant.members_count ?? 1}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="font-semibold text-foreground">
                        {tenant.employees_count ?? 0}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-muted-foreground">
                      {new Date(tenant.created_at).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="size-7 text-muted-foreground hover:text-foreground"
                            />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            render={<Link to={adminTenantDetailsPath(tenant.id)} />}
                          >
                            <Eye className="mr-2 size-3.5" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem render={<Link to={adminTenantEditPath(tenant.id)} />}>
                            <Edit className="mr-2 size-3.5" /> Edit Settings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {tenant.status === "suspended" ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setTargetTenant(tenant);
                                setDialogAction("activate");
                              }}
                              className="text-emerald-600 dark:text-emerald-400"
                            >
                              <ShieldCheck className="mr-2 size-3.5" /> Activate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => {
                                setTargetTenant(tenant);
                                setDialogAction("suspend");
                              }}
                              className="text-amber-600 dark:text-amber-400"
                            >
                              <ShieldAlert className="mr-2 size-3.5" /> Suspend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setTargetTenant(tenant);
                              setDialogAction("delete");
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="flex flex-col gap-3 border-t border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
          <div>
            Showing{" "}
            <span className="font-semibold text-foreground">
              {totalCount > 0 ? (page - 1) * pageSize + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(page * pageSize, totalCount)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{totalCount}</span> organizations
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isPending}
              onClick={() => onPageChange(page - 1)}
              className="h-8 gap-1 text-xs"
            >
              <ChevronLeft className="size-3.5" />
              <span>Previous</span>
            </Button>
            <span className="px-2 font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isPending}
              onClick={() => onPageChange(page + 1)}
              className="h-8 gap-1 text-xs"
            >
              <span>Next</span>
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <TenantStatusDialog
        tenant={targetTenant}
        action={dialogAction}
        open={dialogAction !== null}
        onOpenChange={(open) => !open && setDialogAction(null)}
        onConfirm={handleConfirmAction}
        loading={isMutating}
      />
    </div>
  );
}
