import { apiClient } from "@/lib/api"
import type { ApiResponse, PaginatedResponse } from "@workforce-erp/types"
import type { Employee } from "../types/employees.types"
import type {
  EmployeeDirectoryOptions,
  EmployeeDirectorySummary,
  EmployeesFilters,
} from "../types/employees-filters.types"

export const employeesApi = {
  getEmployees(params?: EmployeesFilters) {
    return apiClient.get<PaginatedResponse<Employee>>("/api/v1/employees", {
      params: params ? { ...params } : undefined,
    })
  },
  getOptions() {
    return apiClient.get<ApiResponse<EmployeeDirectoryOptions>>(
      "/api/v1/employees/options"
    )
  },
  getSummary() {
    return apiClient.get<ApiResponse<EmployeeDirectorySummary>>(
      "/api/v1/employees/summary"
    )
  },
}
