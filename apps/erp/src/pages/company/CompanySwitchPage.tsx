import { useQuery } from "@tanstack/react-query";
import { Building, ChevronRight, Plus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { Card, CardContent } from "@workforce-erp/ui/components/card";
import { apiGet, errorMessage } from "#features/erp-core/api";
import type { CompanyRecord } from "#features/erp-core/types";
import { EmptyPanel, ErpPage, ErrorState, LoadingState, StatusPill } from "#components/erp/ErpPage";
import { companyRoutes, tenantRoutes } from "#routes/paths";

export function CompanySwitchPage() {
  const { tenantKey = "" } = useParams();
  const query = useQuery({
    queryKey: ["companies", tenantKey],
    queryFn: () => apiGet<CompanyRecord[]>("/api/v1/companies"),
  });
  return (
    <ErpPage
      title="Switch company"
      description="Choose the company or branch workspace for operational ERP modules."
      actions={
        <Button nativeButton={false} render={<Link to={tenantRoutes.companyCreate(tenantKey)} />}>
          <Plus />
          New company
        </Button>
      }
    >
      {query.isLoading ? (
        <LoadingState label="Loading companies…" />
      ) : query.isError ? (
        <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />
      ) : (query.data?.length ?? 0) === 0 ? (
        <EmptyPanel
          title="No companies yet"
          description="Create the first company to start using company-scoped ERP modules."
          action={
            <Button
              nativeButton={false}
              render={<Link to={tenantRoutes.companyCreate(tenantKey)} />}
            >
              Create company
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {query.data?.map((company) => (
            <Link
              key={company.id}
              to={companyRoutes.dashboard(tenantKey, company.code || company.id)}
            >
              <Card className="h-full transition hover:-translate-y-0.5 hover:ring-primary/30">
                <CardContent className="flex items-center gap-4 py-1">
                  <div className="grid size-11 place-items-center rounded-3xl bg-primary/10 text-primary">
                    <Building className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{company.name}</p>
                      <StatusPill value={company.is_active ? "active" : "inactive"} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {company.departments_count} departments · {company.employees_count} employees
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </ErpPage>
  );
}
export default CompanySwitchPage;
