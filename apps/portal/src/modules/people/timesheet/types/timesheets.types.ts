export type TimesheetStatus =
  | "present"
  | "absent"
  | "on-leave"
  | "half-day"
  | "pending"
  | "approved"
  | "rejected"

export interface Timesheet {
  id: string
  organization_id: string
  employee_id: string
  date: string
  clock_in: string | null
  clock_out: string | null
  total_hours: number
  status: TimesheetStatus
  notes?: string | null
  created_at?: string
  updated_at?: string
  employee?: {
    id: string
    name: string
    employee_code?: string
    department?: string
    designation?: string
    avatar_url?: string | null
  }
}

export interface ClockInPayload {
  employee_id?: string
}

export interface ClockOutPayload {
  employee_id?: string
}

export interface TodayTimesheetStatus {
  employee_profile_linked: boolean
  is_clocked_in: boolean
  active_timesheet: Timesheet | null
  today: string
  total_today_hours?: number
}
