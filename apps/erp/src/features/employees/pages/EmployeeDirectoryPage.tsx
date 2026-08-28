import { Link, useParams } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { ErpPage, ErrorState, LoadingState } from "#components/erp/ErpPage";
import { EmployeeSummaryCards } from "#features/employees/components/EmployeeSummaryCards.tsx";
import { EmployeeFilters } from "#features/employees/components/EmployeeFilters.tsx";
import { EmployeeTable } from "#features/employees/components/EmployeeTable.tsx";
import { useEmployeeOptions, useEmployees, useEmployeeSummary } from "../hooks/use-employees";
import { useEmployeesFilters } from "../hooks/use-employees-filters";
import { companyRoutes } from "#routes/paths";

export default function EmployeeDirectoryPage() {
  const { tenantKey = "", companyKey = "" } = useParams();
  const { filters, page, pageSize, queryFilters, onFiltersChange, onReset, onPageChange } =
    useEmployeesFilters();
  const employeesQuery = useEmployees(queryFilters);
  const optionsQuery = useEmployeeOptions();
  const summaryQuery = useEmployeeSummary();
  const summary = summaryQuery.data?.data;
  const summaryProps = summary === undefined ? {} : { summary };
  const employees = employeesQuery.data?.data ?? [];
  const totalCount = employeesQuery.data?.meta?.total ?? 0;

  return (
    <ErpPage
      title="Employees"
      description="Browse, search, and manage your organization's workforce."
      actions={
        <Button
          nativeButton={false}
          render={<Link to={companyRoutes.employeeCreate(tenantKey, companyKey)} />}
        >
          <UserPlus />
          Add employee
        </Button>
      }
    >
      <EmployeeSummaryCards {...summaryProps} employees={[]} />
      <EmployeeFilters
        filters={filters}
        departments={optionsQuery.data?.data?.departments ?? []}
        locations={optionsQuery.data?.data?.locations ?? []}
        onFiltersChange={onFiltersChange}
        onReset={onReset}
      />

      {employeesQuery.isPending ? (
        <LoadingState label="Loading employee directory…" />
      ) : employeesQuery.isError ? (
        <ErrorState
          message="Employee data could not be loaded from the server."
          onRetry={() => void employeesQuery.refetch()}
        />
      ) : (
        <EmployeeTable
          employees={employees}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={onPageChange}
        />
      )}
    </ErpPage>
  );
}
