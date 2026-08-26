import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { apiGet, apiPut, errorMessage } from "#features/erp-core/api";
import type { CompanyRecord } from "#features/erp-core/types";
import { CompanyForm, type CompanyPayload } from "#features/erp-core/components/CompanyForm";
import { ErpPage, ErrorState, LoadingState, SectionCard } from "#components/erp/ErpPage";
import { tenantRoutes } from "#routes/paths";

export function CompanyEditPage() {
  const { tenantKey = "", companyId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const companyQuery = useQuery({
    queryKey: ["company", tenantKey, companyId],
    queryFn: () => apiGet<CompanyRecord>(`/api/v1/companies/${encodeURIComponent(companyId)}`),
  });

  const updateCompany = useMutation({
    mutationFn: (payload: CompanyPayload) =>
      apiPut<CompanyRecord>(`/api/v1/companies/${encodeURIComponent(companyId)}`, payload),
    onSuccess: (company) => {
      toast.success("Company updated");
      void queryClient.invalidateQueries({ queryKey: ["companies", tenantKey] });
      void queryClient.invalidateQueries({ queryKey: ["company", tenantKey, companyId] });
      navigate(tenantRoutes.companyDetails(tenantKey, company.id));
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <ErpPage
      title="Edit company"
      description="Update company contact details, identity and operational status."
    >
      {companyQuery.isLoading ? (
        <LoadingState />
      ) : companyQuery.isError || !companyQuery.data ? (
        <ErrorState
          message={errorMessage(companyQuery.error)}
          onRetry={() => void companyQuery.refetch()}
        />
      ) : (
        <SectionCard title="Company profile">
          <CompanyForm
            initial={companyQuery.data}
            submitting={updateCompany.isPending}
            onSubmit={(payload) => updateCompany.mutate(payload)}
            submitLabel="Save changes"
          />
        </SectionCard>
      )}
    </ErpPage>
  );
}

export default CompanyEditPage;
