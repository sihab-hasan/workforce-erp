import { useQuery } from "@tanstack/react-query";
import { Building2, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@workforce-erp/ui/components/card";
import { Badge } from "@workforce-erp/ui/components/badge";
import { apiGet, errorMessage } from "#features/erp-core/api";
import type { OrganizationRecord } from "#features/erp-core/types";
import { ErpPage, ErrorState, LoadingState } from "#components/erp/ErpPage";
import { ERP_PATHS, tenantRoutes } from "#routes/paths";

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
          {(query.data ?? []).map((org) => {
            const isOnboarding = org.onboarding_status === "in_progress";
            const targetPath = isOnboarding
              ? `${ERP_PATHS.onboarding}?tenant=${encodeURIComponent(org.slug)}`
              : tenantRoutes.selectCompany(org.slug);

            return (
              <Link key={org.id} to={targetPath}>
                <Card className="h-full transition hover:-translate-y-0.5 hover:ring-primary/30">
                  <CardContent className="flex items-center gap-4 py-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <Building2 className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{org.name}</p>
                        {isOnboarding ? (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Sparkles className="size-3" /> Setup
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                        {org.role ?? "member"} · {isOnboarding ? "Setup in progress" : org.status}
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </ErpPage>
  );
}

export default TenantSelectPage;
