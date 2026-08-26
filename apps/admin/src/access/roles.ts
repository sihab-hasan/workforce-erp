/** Roles currently allowed into the platform-admin application by the API. */
export const PLATFORM_ROLES = ["owner", "admin"] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export function isPlatformRole(value: string | null | undefined): value is PlatformRole {
  return Boolean(value && (PLATFORM_ROLES as readonly string[]).includes(value));
}
