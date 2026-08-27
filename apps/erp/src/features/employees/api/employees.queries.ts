import { queryOptions } from "@tanstack/react-query";
import { employeesApi } from "./employees.api";
import { employeesKeys } from "../query-keys";
import type { EmployeesFilters } from "../types/employees-filters.types";

export function employeesListQueryOptions(filters?: EmployeesFilters) {
  return queryOptions({
    queryKey: employeesKeys.list(filters as Record<string, unknown> | undefined),
    queryFn: () => employeesApi.getEmployees(filters),
  });
}

export function employeeOptionsQueryOptions() {
  return queryOptions({
    queryKey: employeesKeys.options(),
    queryFn: () => employeesApi.getOptions(),
    staleTime: 5 * 60 * 1000,
  });
}

export function employeeSummaryQueryOptions() {
  return queryOptions({
    queryKey: employeesKeys.summary(),
    queryFn: () => employeesApi.getSummary(),
    staleTime: 30 * 1000,
  });
}
