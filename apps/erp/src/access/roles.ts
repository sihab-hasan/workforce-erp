/** Roles returned by the Laravel organization-membership API. */
export const ROLES = ["owner", "admin", "manager", "staff", "readonly"] as const;
export type Role = (typeof ROLES)[number];

export function isRole(value: string | null | undefined): value is Role {
  return Boolean(value && (ROLES as readonly string[]).includes(value));
}
