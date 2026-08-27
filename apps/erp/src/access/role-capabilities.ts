import { CAPABILITIES, type Capability } from "#access/capabilities";
import type { Role } from "#access/roles";

const ADMIN_CAPABILITIES: readonly Capability[] = CAPABILITIES;

/**
 * Frontend capability projection for the coarse roles exposed by the API.
 * Backend authorization remains authoritative; this map prevents the UI from
 * advertising actions the signed-in role should not normally perform.
 */
export const ROLE_CAPABILITIES: Record<Role, readonly Capability[]> = {
  owner: ADMIN_CAPABILITIES,
  admin: ADMIN_CAPABILITIES,
  manager: [
    "employee.view",
    "leave.review",
    "timesheet.review",
    "approval.review",
    "report.view",
    "notification.view",
  ],
  staff: [
    "employee.view",
    "leave.request",
    "timesheet.manage",
    "document.manage",
    "notification.view",
  ],
  readonly: ["employee.view", "report.view", "notification.view"],
};
