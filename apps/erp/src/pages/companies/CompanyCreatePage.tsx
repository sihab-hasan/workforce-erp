import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { apiPost, errorMessage } from "#features/erp-core/api";
import type { CompanyRecord } from "#features/erp-core/types";
import { CompanyForm, type CompanyPayload } from "#features/erp-core/components/CompanyForm";
import { ErpPage, SectionCard } from "#components/erp/ErpPage";
import { tenantRoutes } from "#routes/paths";

export function CompanyCreatePage() {
  const { tenantKey = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: CompanyPayload) => apiPost<CompanyRecord>("/api/v1/companies", payload),
    onSuccess: (company) => {
      toast.success("Company created");
      void queryClient.invalidateQueries({ queryKey: ["companies", tenantKey] });
      navigate(tenantRoutes.companyDetails(tenantKey, company.id));
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  return (
    <ErpPage
      title="Create company"
      description="Create an operational company/branch workspace for this organization."
    >
      <SectionCard title="Company profile">
        <CompanyForm
          submitting={mutation.isPending}
          onSubmit={(payload) => mutation.mutate(payload)}
          submitLabel="Create company"
        />
      </SectionCard>
    </ErpPage>
  );
}
export default CompanyCreatePage;
