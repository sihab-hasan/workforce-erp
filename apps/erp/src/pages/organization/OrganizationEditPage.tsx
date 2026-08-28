import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@workforce-erp/ui/components/button";
import { apiGet, apiPut, errorMessage } from "#features/erp-core/api";
import type { OrganizationRecord } from "#features/erp-core/types";
import {
  OrganizationForm,
  type OrganizationPayload,
} from "#features/erp-core/components/OrganizationForm";
import { ErpPage, ErrorState, LoadingState, SectionCard } from "#components/erp/ErpPage";
import { ERP_PATHS, tenantRoutes } from "#routes/paths";

type UpdateOrganizationInput = {
  id: string;
  payload: OrganizationPayload;
};

export default function OrganizationEditPage() {
  const { tenantKey = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const backUrl = tenantKey ? tenantRoutes.settings(tenantKey) : ERP_PATHS.tenantSelect;

  const organizationQuery = useQuery({
    queryKey: ["organization", tenantKey],
    queryFn: () => apiGet<OrganizationRecord>("/api/v1/organizations/current"),
  });

  const organization = organizationQuery.data;

  const updateOrganization = useMutation({
    mutationFn: ({ id, payload }: UpdateOrganizationInput) =>
      apiPut<OrganizationRecord>(`/api/v1/organizations/${encodeURIComponent(id)}`, payload),
    onSuccess: (organization) => {
      toast.success("Organization updated");
      void queryClient.invalidateQueries({ queryKey: ["organization"] });
      navigate(tenantRoutes.organization(organization.slug));
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <ErpPage
      title="Edit organization"
      description="Update workspace identity, company address, and regional configuration."
      actions={
        <Button variant="outline" nativeButton={false} render={<Link to={backUrl} />}>
          <ArrowLeft />
          Back to settings
        </Button>
      }
    >
      {organizationQuery.isLoading ? (
        <LoadingState />
      ) : organizationQuery.isError || !organization ? (
        <ErrorState
          message={errorMessage(organizationQuery.error)}
          onRetry={() => void organizationQuery.refetch()}
        />
      ) : (
        <SectionCard title="Organization profile">
          <OrganizationForm
            initial={organization}
            submitting={updateOrganization.isPending}
            onSubmit={(payload) => updateOrganization.mutate({ id: organization.id, payload })}
          />
        </SectionCard>
      )}
    </ErpPage>
  );
}
