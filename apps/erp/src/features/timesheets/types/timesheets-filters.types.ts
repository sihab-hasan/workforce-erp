import type { TimesheetStatus } from "./timesheets.types";

export interface TimesheetFilters {
  employee_id?: string;
  start_date?: string;
  end_date?: string;
  status?: TimesheetStatus | "all";
  search?: string;
  page?: number;
  per_page?: number;
}
