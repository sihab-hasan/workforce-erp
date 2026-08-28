export const CAPABILITIES = [
  "organization.manage",
  "company.manage",
  "department.manage",
  "employee.read",
  "employee.manage",
  "leave.manage",
  "leave.approve",
  "timesheet.manage",
  "approval.approve",
  "document.manage",
  "report.view",
  "notification.view",
  "user.manage",
  "role.manage",
  "settings.manage",
] as const;
export type Capability = (typeof CAPABILITIES)[number];
