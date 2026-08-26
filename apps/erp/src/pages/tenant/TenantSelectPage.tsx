import { useQuery } from "@tanstack/react-query";
import { Building2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@workforce-erp/ui/components/card";
import { apiGet, errorMessage } from "#features/erp-core/api";
import type { OrganizationRecord } from "#features/erp-core/types";
import { ErpPage, ErrorState, LoadingState } from "#components/erp/ErpPage";
import { tenantRoutes } from "#routes/paths";

export function TenantSelectPage() {
  const query = useQuery({
    queryKey: ["organizations"],
    queryFn: () => apiGet<OrganizationRecord[]>("/api/v1/organizations"),
  });
  return (
    <ErpPage
      title="Select organization"
      description="Choose the organization workspace you want to access."
    >
      {query.isLoading ? (
        <LoadingState label="Loading organizations…" />
      ) : query.isError ? (
        <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(query.data ?? []).map((org) => (
            <Link key={org.id} to={tenantRoutes.selectCompany(org.slug)}>
              <Card className="h-full transition hover:-translate-y-0.5 hover:ring-primary/30">
                <CardContent className="flex items-center gap-4 py-1">
                  <div className="grid size-11 place-items-center rounded-3xl bg-primary/10 text-primary">
                    <Building2 className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{org.name}</p>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">
                      {org.role ?? "member"} · {org.status}
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
export default TenantSelectPage;
