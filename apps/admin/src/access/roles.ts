export const PLATFORM_ROLES = [
  "platform_super_admin",
  "platform_security_admin",
  "platform_support",
  "platform_auditor",
] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];
export function isPlatformRole(value: string | null | undefined): value is PlatformRole {
  return Boolean(value && (PLATFORM_ROLES as readonly string[]).includes(value));
}
