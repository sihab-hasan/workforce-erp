import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { apiGet, apiPut, errorMessage } from "#features/erp-core/api";
import type { EmployeeRecord } from "#features/erp-core/types";
import {
  EmployeeForm,
  type EmployeeOptions,
  type EmployeePayload,
} from "#features/erp-core/components/EmployeeForm";
import { ErpPage, ErrorState, LoadingState, SectionCard } from "#components/erp/ErpPage";
import { companyRoutes } from "#routes/paths";

export default function EditEmployeePage() {
  const { tenantKey = "", companyKey = "", employeeId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const employeeQuery = useQuery({
    queryKey: ["employee", tenantKey, companyKey, employeeId],
    queryFn: () => apiGet<EmployeeRecord>(`/api/v1/employees/${employeeId}`),
  });

  const optionsQuery = useQuery({
    queryKey: ["employee-options", tenantKey, companyKey],
    queryFn: () => apiGet<EmployeeOptions>("/api/v1/employees/options"),
  });

  const updateEmployee = useMutation({
    mutationFn: (payload: EmployeePayload) =>
      apiPut<EmployeeRecord>(`/api/v1/employees/${employeeId}`, payload),
    onSuccess: (employee) => {
      toast.success("Employee updated");
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
      void queryClient.invalidateQueries({
        queryKey: ["employee", tenantKey, companyKey, employeeId],
      });
      navigate(companyRoutes.employeeDetails(tenantKey, companyKey, employee.id));
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <ErpPage
      title="Edit employee"
      description="Update employment, reporting and contact information."
    >
      {employeeQuery.isLoading || optionsQuery.isLoading ? (
        <LoadingState label="Loading employee details…" />
      ) : employeeQuery.isError || !employeeQuery.data ? (
        <ErrorState
          message={errorMessage(employeeQuery.error)}
          onRetry={() => void employeeQuery.refetch()}
        />
      ) : optionsQuery.isError || !optionsQuery.data ? (
        <ErrorState
          message={errorMessage(optionsQuery.error)}
          onRetry={() => void optionsQuery.refetch()}
        />
      ) : (
        <SectionCard title="Employee profile">
          <EmployeeForm
            initial={employeeQuery.data}
            options={optionsQuery.data}
            submitting={updateEmployee.isPending}
            onSubmit={(payload) => updateEmployee.mutate(payload)}
            submitLabel="Save changes"
          />
        </SectionCard>
      )}
    </ErpPage>
  );
}
