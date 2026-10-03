import { Link } from "react-router-dom";
import {
  Building2,
  MapPin,
  Layers,
  Users,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Globe,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workforce-erp/ui/components/table";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Button } from "@workforce-erp/ui/components/button";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import { adminOrganizationDetailsPath, adminOrganizationEditPath } from "#routes/paths";
import type { OrganizationSummary } from "../types/organizations.types";

export interface OrganizationTableProps {
  organizations: OrganizationSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  isPending?: boolean;
  isError?: boolean;
  onPageChange: (page: number) => void;
  onRetry?: () => void;
}

export function OrganizationTable({
  organizations,
  page,
  pageSize,
  totalCount,
  isPending = false,
  isError = false,
  onPageChange,
  onRetry,
}: OrganizationTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (isPending) {
    return (
      <div className="rounded-xl border border-border/70 bg-card/70 p-6 shadow-xs">
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <Building2 className="mb-2 size-8 text-destructive" />
        <p className="text-sm font-semibold text-destructive">Failed to load organizations</p>
        <p className="mt-1 text-xs text-muted-foreground">
          An error occurred while communicating with the platform API.
        </p>
        {onRetry ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-4 h-8 gap-1.5 text-xs"
          >
            <RefreshCw className="size-3.5" />
            Retry
          </Button>
        ) : null}
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
        <Building2 className="mb-3 size-10 text-muted-foreground/60" />
        <h3 className="text-base font-semibold text-foreground">No organizations found</h3>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          No corporate entities matched your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card/70 shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold text-foreground">
                Organization & Legal Entity
              </TableHead>
              <TableHead className="font-semibold text-foreground">Headquarters & Region</TableHead>
              <TableHead className="font-semibold text-foreground">Branches</TableHead>
              <TableHead className="font-semibold text-foreground">Departments</TableHead>
              <TableHead className="font-semibold text-foreground">Headcount</TableHead>
              <TableHead className="font-semibold text-foreground">Status</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => {
              return (
                <TableRow
                  key={org.id}
                  className="border-border/60 transition-colors hover:bg-muted/30"
                >
                  {/* Organization & Legal Entity */}
                  <TableCell className="py-3.5">
                    <div className="flex flex-col">
                      <Link
                        to={adminOrganizationDetailsPath(org.id)}
                        className="font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {org.name}
                      </Link>
                      <span className="text-[11px] text-muted-foreground">
                        {org.legal_name || "—"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Headquarters & Region */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                      <Globe className="size-3.5 shrink-0 text-muted-foreground" />
                      <span>{org.country || "—"}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        ({org.currency || "USD"})
                      </span>
                    </div>
                  </TableCell>

                  {/* Branches */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <MapPin className="size-3.5 text-amber-500" />
                      <span>{org.branches_count ?? 0}</span>
                    </div>
                  </TableCell>

                  {/* Departments */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Layers className="size-3.5 text-purple-500" />
                      <span>{org.departments_count ?? 0}</span>
                    </div>
                  </TableCell>

                  {/* Headcount */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Users className="size-3.5 text-emerald-500" />
                      <span>{org.employees_count ?? 0} Employees</span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant={org.status === "active" ? "outline" : "secondary"}
                      className="capitalize text-[10px] font-medium"
                    >
                      {org.status}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        render={<Link to={adminOrganizationDetailsPath(org.id)} />}
                        className="h-8 gap-1 px-2 text-xs font-medium"
                      >
                        <Eye className="size-3.5 text-primary" />
                        <span className="hidden sm:inline">Corporate Tree</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link to={adminOrganizationEditPath(org.id)} />}
                        className="h-8 gap-1 px-2 text-xs font-medium"
                      >
                        <Edit className="size-3.5 text-muted-foreground" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 ? (
        <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
          <p>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of{" "}
            {totalCount} organizations
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="size-8 p-0"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-2 font-mono text-xs font-semibold text-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="size-8 p-0"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
