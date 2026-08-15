export interface ApiClientOptions {
  baseUrl: string
}

export type EmploymentStatus = "active" | "on-leave" | "probation" | "inactive"
export type EmploymentType = "full-time" | "part-time" | "contractor" | "intern"

export interface Employee {
  id: string
  name: string
  initials: string
  title: string
  department: string
  employmentType: EmploymentType
  status: EmploymentStatus
  manager: string
  location: string
  hireDate: string
  email: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    pageSize: number
  }
}

export interface GetEmployeesParams {
  search?: string
  department?: string
  status?: string
  location?: string
  page?: number
}

export interface ApiClient {
  baseUrl: string
  getHealth(): Promise<{ status: string; service: string }>
  getEmployees(params?: GetEmployeesParams): Promise<PaginatedResponse<Employee>>
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  return {
    baseUrl: options.baseUrl.replace(/\/$/, ""),
    async getHealth() {
      const response = await fetch(`${this.baseUrl}/api/health`)

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      return response.json() as Promise<{ status: string; service: string }>
    },
    async getEmployees(params = {}) {
      const url = new URL(`${this.baseUrl}/api/employees`)
      
      if (params.search) url.searchParams.set('search', params.search)
      if (params.department) url.searchParams.set('department', params.department)
      if (params.status) url.searchParams.set('status', params.status)
      if (params.location) url.searchParams.set('location', params.location)
      if (params.page) url.searchParams.set('page', params.page.toString())

      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      return response.json() as Promise<PaginatedResponse<Employee>>
    },
  }
}
