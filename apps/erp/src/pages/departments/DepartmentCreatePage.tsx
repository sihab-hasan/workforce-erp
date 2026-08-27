import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { apiGet, apiPost, errorMessage } from "#features/erp-core/api";
import type { DepartmentRecord } from "#features/erp-core/types";
import {
  DepartmentForm,
  type DepartmentPayload,
  type EmployeeOption,
} from "#features/erp-core/components/DepartmentForm";
import { ErpPage, SectionCard } from "#components/erp/ErpPage";
import { companyRoutes } from "#routes/paths";

type Options = { managers: EmployeeOption[] };
export default function CreateDepartmentPage() {
  const { tenantKey = "", companyKey = "" } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const options = useQuery({
    queryKey: ["employee-options", tenantKey, companyKey],
    queryFn: () => apiGet<Options>("/api/v1/employees/options"),
  });
  const mutation = useMutation({
    mutationFn: (payload: DepartmentPayload) =>
      apiPost<DepartmentRecord>("/api/v1/departments", payload),
    onSuccess: (d) => {
      toast.success("Department created");
      void qc.invalidateQueries({ queryKey: ["departments", tenantKey, companyKey] });
      nav(companyRoutes.departmentDetails(tenantKey, companyKey, d.id));
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <ErpPage title="Create department" description="Add a department to the selected company.">
      <SectionCard title="Department details">
        <DepartmentForm
          managers={options.data?.managers ?? []}
          submitting={mutation.isPending}
          onSubmit={(p) => mutation.mutate(p)}
          submitLabel="Create department"
        />
      </SectionCard>
    </ErpPage>
  );
}
