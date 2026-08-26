import { apiClient } from "#lib/api";
import type { ApiResponse, PaginatedResponse } from "@workforce-erp/contracts";
import type { Employee } from "../types/employees.types";
import type {
  EmployeeDirectoryOptions,
  EmployeeDirectorySummary,
  EmployeesFilters,
} from "../types/employees-filters.types";

export const employeesApi = {
  getEmployees(params?: EmployeesFilters) {
    const options = params === undefined ? {} : { params: { ...params } };
    return apiClient.get<PaginatedResponse<Employee>>("/api/v1/employees", options);
  },
  getOptions() {
    return apiClient.get<ApiResponse<EmployeeDirectoryOptions>>("/api/v1/employees/options");
  },
  getSummary() {
    return apiClient.get<ApiResponse<EmployeeDirectorySummary>>("/api/v1/employees/summary");
  },
};
