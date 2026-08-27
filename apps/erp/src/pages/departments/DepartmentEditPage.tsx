import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { apiGet, apiPut, errorMessage } from "#features/erp-core/api";
import type { DepartmentRecord } from "#features/erp-core/types";
import {
  DepartmentForm,
  type DepartmentPayload,
  type EmployeeOption,
} from "#features/erp-core/components/DepartmentForm";
import { ErpPage, ErrorState, LoadingState, SectionCard } from "#components/erp/ErpPage";
import { companyRoutes } from "#routes/paths";

type Options = { managers: EmployeeOption[] };

export default function EditDepartmentPage() {
  const { tenantKey = "", companyKey = "", departmentId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const departmentQuery = useQuery({
    queryKey: ["department", tenantKey, companyKey, departmentId],
    queryFn: () =>
      apiGet<DepartmentRecord>(`/api/v1/departments/${encodeURIComponent(departmentId)}`),
  });

  const optionsQuery = useQuery({
    queryKey: ["employee-options", tenantKey, companyKey],
    queryFn: () => apiGet<Options>("/api/v1/employees/options"),
  });

  const updateDepartment = useMutation({
    mutationFn: (payload: DepartmentPayload) =>
      apiPut<DepartmentRecord>(`/api/v1/departments/${encodeURIComponent(departmentId)}`, payload),
    onSuccess: (department) => {
      toast.success("Department updated");
      void queryClient.invalidateQueries({ queryKey: ["departments", tenantKey, companyKey] });
      void queryClient.invalidateQueries({
        queryKey: ["department", tenantKey, companyKey, departmentId],
      });
      navigate(companyRoutes.departmentDetails(tenantKey, companyKey, department.id));
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <ErpPage title="Edit department" description="Update department identity, manager and status.">
      {departmentQuery.isLoading || optionsQuery.isLoading ? (
        <LoadingState label="Loading department details…" />
      ) : departmentQuery.isError || !departmentQuery.data ? (
        <ErrorState
          message={errorMessage(departmentQuery.error)}
          onRetry={() => void departmentQuery.refetch()}
        />
      ) : optionsQuery.isError || !optionsQuery.data ? (
        <ErrorState
          message={errorMessage(optionsQuery.error)}
          onRetry={() => void optionsQuery.refetch()}
        />
      ) : (
        <SectionCard title="Department details">
          <DepartmentForm
            initial={departmentQuery.data}
            managers={optionsQuery.data.managers}
            submitting={updateDepartment.isPending}
            onSubmit={(payload) => updateDepartment.mutate(payload)}
            submitLabel="Save changes"
          />
        </SectionCard>
      )}
    </ErpPage>
  );
}
