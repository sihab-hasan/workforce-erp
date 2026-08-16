import { useQuery } from "@tanstack/react-query"
import {
  employeeOptionsQueryOptions,
  employeeSummaryQueryOptions,
  employeesListQueryOptions,
} from "../api/employees.queries"
import type { EmployeesFilters } from "../types/employees-filters.types"

export function useEmployees(filters?: EmployeesFilters) {
  return useQuery(employeesListQueryOptions(filters))
}

export function useEmployeeOptions() {
  return useQuery(employeeOptionsQueryOptions())
}

export function useEmployeeSummary() {
  return useQuery(employeeSummaryQueryOptions())
}
