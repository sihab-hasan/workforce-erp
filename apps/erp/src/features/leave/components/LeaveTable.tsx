import { AlertCircle, Calendar, Eye, Inbox, User, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CapabilityGate } from "@workforce-erp/authorization";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Button } from "@workforce-erp/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workforce-erp/ui/components/table";
import { errorMessage, formatDate } from "#features/erp-core/api";
import { companyRoutes } from "#routes/paths";
import { useCancelLeaveMutation } from "../api/leave.mutations";
import { useCurrentEmployeeId } from "../hooks/use-leave";
import type { Leave, LeaveStatus } from "../types/leave.types";

export interface LeaveTableProps {
  leaves: Leave[];
  isPending: boolean;
  isError: boolean;
  onRetry?: () => void;
  /** Hide the Employee column when every row belongs to the same employee. */
  showEmployee?: boolean;
  title?: string;
  description?: string;
  page?: number;
  pageSize?: number;
  total?: number;
  lastPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

const STATUS_BADGES: Record<
  LeaveStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
    className?: string;
  }
> = {
  pending: {
    label: "Pending",
    variant: "secondary",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  approved: {
    label: "Approved",
    variant: "default",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
  },
  cancelled: {
    label: "Cancelled",
    variant: "outline",
    className: "text-muted-foreground border-dashed",
  },
};

function formatDays(value: number): string {
  const days = Number(value);
  return Number.isInteger(days) ? String(days) : days.toFixed(1);
}

function LeaveRowActions({ leave }: { leave: Leave }) {
  const { tenantKey = "", companyKey = "" } = useParams();
  const currentEmployeeId = useCurrentEmployeeId();
  const cancelLeave = useCancelLeaveMutation(leave.id);

  const isOwnRequest = currentEmployeeId !== null && leave.employee?.id === currentEmployeeId;
  const canCancel = leave.status === "pending" && isOwnRequest;

  function cancelRequest() {
    cancelLeave.mutate(undefined, {
      onSuccess: () => toast.success("Leave request cancelled"),
      onError: (error) =>
        toast.error("Unable to cancel leave request", { description: errorMessage(error) }),
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {canCancel && (
        <CapabilityGate capability="leave.request">
          <Button
            size="icon-sm"
            variant="ghost"
            disabled={cancelLeave.isPending}
            onClick={cancelRequest}
            aria-label="Cancel leave request"
            title="Cancel request"
          >
            <X />
          </Button>
        </CapabilityGate>
      )}
      <Button
        size="icon-sm"
        variant="ghost"
        nativeButton={false}
        render={<Link to={companyRoutes.leaveDetails(tenantKey, companyKey, leave.id)} />}
        aria-label="View details"
        title="View details"
      >
        <Eye />
      </Button>
    </div>
  );
}

export function LeaveTable({
  leaves,
  isPending,
  isError,
  onRetry,
  showEmployee = true,
  title = "Leave requests",
  description = "Submitted leave requests and their current review status.",
  page,
  pageSize,
  total,
  lastPage,
  onPageChange,
  className,
}: LeaveTableProps) {
  const showPagination =
    !isPending && !isError && page !== undefined && pageSize !== undefined && total !== undefined;
  const effectiveLastPage = Math.max(
    1,
    lastPage ?? Math.ceil((total ?? 0) / Math.max(1, pageSize ?? 1)),
  );
  const from = !total ? 0 : ((page ?? 1) - 1) * (pageSize ?? 0) + 1;
  const to = Math.min((page ?? 1) * (pageSize ?? 0), total ?? 0);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <AlertCircle className="size-8 text-destructive" aria-hidden />
            <p className="text-sm font-medium">Failed to load leave requests</p>
            <p className="text-xs text-muted-foreground">
              An error occurred while communicating with the server.
            </p>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
                Try Again
              </Button>
            )}
          </div>
        ) : isPending ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : leaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
            <Inbox className="size-8 stroke-[1.5]" aria-hidden />
            <p className="text-sm font-medium text-foreground">No leave requests found</p>
            <p className="text-xs">Submit a request or adjust filters to see records.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {showEmployee && <TableHead className="pl-6">Employee</TableHead>}
                <TableHead className={showEmployee ? undefined : "pl-6"}>Leave Type</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Total Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.map((leave) => {
                const badgeConfig = STATUS_BADGES[leave.status] ?? {
                  label: leave.status,
                  variant: "secondary" as const,
                };

                return (
                  <TableRow key={leave.id}>
                    {showEmployee && (
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2">
                          <User className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {leave.employee?.name ?? "Unknown employee"}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {leave.employee?.department ?? leave.employee?.employee_id ?? "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    )}

                    <TableCell className={showEmployee ? undefined : "pl-6"}>
                      <span className="text-sm">{leave.leave_type?.name ?? "—"}</span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                        <span>
                          {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-semibold">{formatDays(leave.total_days)}</span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={badgeConfig.variant}
                        className={`text-xs ${badgeConfig.className ?? ""}`}
                      >
                        {badgeConfig.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="pr-6 text-right">
                      <LeaveRowActions leave={leave} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {showPagination && total > 0 && onPageChange && (
          <div className="flex flex-col gap-3 border-t px-6 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">
              Showing {from}–{to} of {total} records
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={(page ?? 1) <= 1}
                onClick={() => onPageChange((page ?? 1) - 1)}
              >
                Previous
              </Button>
              <span className="min-w-20 text-center text-xs text-muted-foreground">
                Page {page} of {effectiveLastPage}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={(page ?? 1) >= effectiveLastPage}
                onClick={() => onPageChange((page ?? 1) + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
