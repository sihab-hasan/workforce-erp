import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { apiGet, apiPost, errorMessage } from "#features/erp-core/api";
import type { EmployeeRecord } from "#features/erp-core/types";
import {
  EmployeeForm,
  type EmployeeOptions,
  type EmployeePayload,
} from "#features/erp-core/components/EmployeeForm";
import { ErpPage, ErrorState, LoadingState, SectionCard } from "#components/erp/ErpPage";
import { companyRoutes } from "#routes/paths";

export default function CreateEmployeePage() {
  const { tenantKey = "", companyKey = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const optionsQuery = useQuery({
    queryKey: ["employee-options", tenantKey, companyKey],
    queryFn: () => apiGet<EmployeeOptions>("/api/v1/employees/options"),
  });

  const createEmployee = useMutation({
    mutationFn: (payload: EmployeePayload) => apiPost<EmployeeRecord>("/api/v1/employees", payload),
    onSuccess: (employee) => {
      toast.success("Employee created");
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
      navigate(companyRoutes.employeeDetails(tenantKey, companyKey, employee.id));
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <ErpPage
      title="Create employee"
      description="Create a complete employee profile inside the selected company."
    >
      {optionsQuery.isLoading ? (
        <LoadingState label="Loading employee options…" />
      ) : optionsQuery.isError || !optionsQuery.data ? (
        <ErrorState
          message={errorMessage(optionsQuery.error)}
          onRetry={() => void optionsQuery.refetch()}
        />
      ) : (
        <SectionCard title="Employee profile">
          <EmployeeForm
            options={optionsQuery.data}
            submitting={createEmployee.isPending}
            onSubmit={(payload) => createEmployee.mutate(payload)}
            submitLabel="Create employee"
          />
        </SectionCard>
      )}
    </ErpPage>
  );
}
