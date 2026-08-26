import type { EmploymentStatus } from "./employees.types";

export interface EmployeesFilters {
  search?: string;
  department?: string;
  status?: EmploymentStatus;
  location?: string;
  page?: number;
  per_page?: number;
}

export interface EmployeeDirectoryOptions {
  departments: string[];
  locations: string[];
}

export interface EmployeeDirectorySummary {
  total: number;
  active: number;
  on_leave: number;
  probation: number;
  new_this_month: number;
}
