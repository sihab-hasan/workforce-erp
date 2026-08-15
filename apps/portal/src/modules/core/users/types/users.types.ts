/**
 * Account activation status for a system user.
 *
 * - `active`    — can log in and perform permitted actions
 * - `inactive`  — account exists but access is revoked
 * - `invited`   — invitation sent, registration not yet completed
 * - `suspended` — temporarily blocked (e.g. billing, security)
 */
export type UserAccountStatus = "active" | "inactive" | "invited" | "suspended"

/**
 * The system-level role assigned to a user account.
 * Fine-grained permission enforcement is handled by the permissions package;
 * this role is the coarse-grained tier stored on the user record itself.
 */
export type UserRole = "owner" | "admin" | "manager" | "staff" | "readonly"

// ---------------------------------------------------------------------------
// Core domain interfaces
// ---------------------------------------------------------------------------

/**
 * Slim organisation reference embedded inside a User or fetched as options.
 */
export interface UserOrganization {
  id: string
  name: string
  slug?: string
}

/**
 * Role option returned from API for dropdown selection.
 */
export interface RoleOption {
  id: string
  name: string
  slug: UserRole
  description?: string
}

/**
 * Employee option returned from API for dropdown linking.
 */
export interface EmployeeOption {
  id: string
  name: string
  department?: string | null
  designation?: string | null
  email?: string
}

/**
 * Slim employee record reference embedded inside a User.
 * Present only when the account is linked to an Employee record in the
 * People module (i.e. the user is also a staff member).
 */
export interface UserEmployeeLink {
  /** Employee record primary key */
  employee_id: string
  /** Employee display name (may differ from account name) */
  employee_name: string
  /** Department the employee belongs to */
  department: string | null
  /** Job title / designation */
  designation: string | null
}

/**
 * Full user account as returned by `GET /api/users/{id}`.
 */
export interface User {
  id: string
  /** Full display name */
  name: string
  /** Primary email address — used for login */
  email: string
  /** Coarse-grained system role */
  role: UserRole
  /** Account lifecycle status */
  status: UserAccountStatus
  /** Organisation the user belongs to */
  organization: UserOrganization
  /**
   * Linked employee record.
   * `null` when the user is a pure admin / service account with no employee record.
   */
  employee: UserEmployeeLink | null
  /** ISO 8601 — when the account was created / invitation was sent */
  created_at: string
  /** ISO 8601 — last profile update */
  updated_at: string
  /** ISO 8601 — most recent successful login. Null if never logged in. */
  last_login_at: string | null
}

/**
 * Slim user summary returned in list responses.
 * Omits nested objects that are expensive to eager-load at scale.
 */
export interface UserSummary {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserAccountStatus
  /** Organization name (denormalised for table display) */
  organization_name: string
  /** Organization ID if present */
  organization_id?: string
  /** Employee record id when linked, otherwise null */
  employee_id: string | null
  /** Denormalized employee name if present */
  employee_name?: string | null
  created_at: string
  last_login_at: string | null
}

// ---------------------------------------------------------------------------
// Request / payload interfaces
// ---------------------------------------------------------------------------

/**
 * Payload for `POST /api/users` — invites a new user.
 * The backend sends the invitation email and creates an `invited` account.
 */
export interface InviteUserPayload {
  name: string
  email: string
  role: UserRole
  /** Organization ID association */
  organization_id?: string
  /**
   * Optional: link the new account to an existing employee record at invite time.
   * If omitted the link can be established later via `PUT /api/users/{id}`.
   */
  employee_id?: string | null
}

/**
 * Payload for `PUT /api/users/{id}` — updates basic account information.
 * All fields are optional; only supplied fields are changed.
 */
export interface UpdateUserPayload {
  name?: string
  role?: UserRole
  organization_id?: string
  /** Re-assign or clear the employee record link. Pass `null` to unlink. */
  employee_id?: string | null
}
