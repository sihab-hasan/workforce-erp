import { useQuery } from "@tanstack/react-query";
import { Eye, Pencil, Plus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { apiGet, errorMessage } from "#features/erp-core/api";
import type { CompanyRecord } from "#features/erp-core/types";
import {
  DataTable,
  EmptyPanel,
  ErpPage,
  ErrorState,
  LoadingState,
  StatusPill,
} from "#components/erp/ErpPage";
import { tenantRoutes } from "#routes/paths";

export function CompaniesPage() {
  const { tenantKey = "" } = useParams();
  const query = useQuery({
    queryKey: ["companies", tenantKey],
    queryFn: () => apiGet<CompanyRecord[]>("/api/v1/companies"),
  });
  return (
    <ErpPage
      title="Companies"
      description="Manage the legal/operational company workspaces inside this organization."
      actions={
        <Button nativeButton={false} render={<Link to={tenantRoutes.companyCreate(tenantKey)} />}>
          <Plus />
          New company
        </Button>
      }
    >
      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />
      ) : !query.data?.length ? (
        <EmptyPanel title="No companies" description="Create your first company workspace." />
      ) : (
        <DataTable
          columns={["Company", "Code", "Status", "Departments", "Employees", "Actions"]}
          rows={query.data.map((c) => [
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.email || c.address || "—"}</p>
            </div>,
            c.code || "—",
            <StatusPill value={c.is_active ? "active" : "inactive"} />,
            c.departments_count,
            c.employees_count,
            <div className="flex gap-1">
              <Button
                size="icon-sm"
                variant="ghost"
                nativeButton={false}
                render={
                  <Link
                    to={tenantRoutes.companyDetails(tenantKey, c.id)}
                    aria-label="View company"
                  />
                }
              >
                <Eye />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                nativeButton={false}
                render={
                  <Link to={tenantRoutes.companyEdit(tenantKey, c.id)} aria-label="Edit company" />
                }
              >
                <Pencil />
              </Button>
            </div>,
          ])}
          rowKeys={query.data.map((company) => company.id)}
        />
      )}
    </ErpPage>
  );
}
export default CompaniesPage;
