import { apiClient } from "@/lib/api"
import type { ApiResponse } from "@workforce-erp/types"
import type { Employee } from "../types/employees.types"

export const employeesApi = {
  /**
   * Get paginated and filtered list of employees.
   */
  getEmployees(params?: {
    search?: string
    department?: string
    status?: string
    location?: string
    page?: number
    per_page?: number
  }) {
    return apiClient.get<ApiResponse<Employee[]>>("/api/v1/employees", {
      params,
    })
  },

  /**
   * Get employee by ID.
   */
  getEmployeeById(id: string) {
    return apiClient.get<ApiResponse<Employee>>(`/api/v1/employees/${id}`)
  },

  /**
   * Create a new employee.
   */
  createEmployee(data: Partial<Employee>) {
    return apiClient.post<ApiResponse<Employee>>("/api/v1/employees", data)
  },

  /**
   * Update an existing employee.
   */
  updateEmployee(id: string, data: Partial<Employee>) {
    return apiClient.put<ApiResponse<Employee>>(`/api/v1/employees/${id}`, data)
  },

  /**
   * Delete an employee.
   */
  deleteEmployee(id: string) {
    return apiClient.delete<ApiResponse<void>>(`/api/v1/employees/${id}`)
  },
}
