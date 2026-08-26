import { Separator } from "@workforce-erp/ui/components/separator";
import { EmployeeSummaryCards } from "#features/employees/components/EmployeeSummaryCards.tsx";
import { EmployeeFilters } from "#features/employees/components/EmployeeFilters.tsx";
import { EmployeeTable } from "#features/employees/components/EmployeeTable.tsx";
import { useEmployeeOptions, useEmployees, useEmployeeSummary } from "../hooks/use-employees";
import { useEmployeesFilters } from "../hooks/use-employees-filters";

export default function EmployeeDirectoryPage() {
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
    <div className="space-y-6 pb-20 md:pb-0">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            People · Employees
          </p>
          <h2 className="mt-1 font-heading text-xl font-semibold text-foreground sm:text-2xl">
            Employee Directory
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse, search, and manage your organisation&apos;s workforce.
          </p>
        </div>
      </header>

      <Separator />
      <EmployeeSummaryCards {...summaryProps} employees={[]} />
      <Separator />
      <EmployeeFilters
        filters={filters}
        departments={optionsQuery.data?.data?.departments ?? []}
        locations={optionsQuery.data?.data?.locations ?? []}
        onFiltersChange={onFiltersChange}
        onReset={onReset}
      />

      {employeesQuery.isPending ? (
        <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
          Loading employees from the API…
        </div>
      ) : employeesQuery.isError ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive"
        >
          Employee data could not be loaded.{" "}
          <button
            type="button"
            className="font-medium underline"
            onClick={() => void employeesQuery.refetch()}
          >
            Retry
          </button>
        </div>
      ) : (
        <EmployeeTable
          employees={employees}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
