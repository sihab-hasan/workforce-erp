export const LEAVE_PERMISSIONS = {
  VIEW: "leave.view",
  CREATE: "leave.create",
  APPROVE: "leave.approve",
  MANAGE: "leave.manage",
} as const;

export type LeavePermission = (typeof LEAVE_PERMISSIONS)[keyof typeof LEAVE_PERMISSIONS];
