export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveEmployeeSummary {
  id: string;
  employee_id: string;
  name: string;
  department?: string | null;
}

export interface LeaveTypeSummary {
  id: string;
  name: string;
  code: string;
  is_paid: boolean;
}

export interface LeaveReviewerSummary {
  id: string;
  name: string;
}

export interface Leave {
  id: string;
  status: LeaveStatus;
  employee: LeaveEmployeeSummary | null;
  leave_type: LeaveTypeSummary | null;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string | null;
  review_note?: string | null;
  reviewer?: LeaveReviewerSummary | null;
  reviewed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Per-type allowance balance returned by `GET /api/v1/leave-requests/options`. */
export interface LeaveTypeBalance {
  id: string;
  name: string;
  code: string;
  annual_allowance: number;
  is_paid: boolean;
  used: number;
  remaining: number;
}

export interface LeaveOptions {
  types: LeaveTypeBalance[];
}

export interface CreateLeavePayload {
  leave_type_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
}
