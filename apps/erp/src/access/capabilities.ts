export const CAPABILITIES = [
  "organization.manage",
  "company.manage",
  "department.manage",
  "employee.view",
  "employee.manage",
  "leave.request",
  "leave.review",
  "timesheet.manage",
  "timesheet.review",
  "approval.review",
  "document.manage",
  "report.view",
  "notification.view",
  "user.manage",
  "role.manage",
  "settings.manage",
] as const;
export type Capability = (typeof CAPABILITIES)[number];
