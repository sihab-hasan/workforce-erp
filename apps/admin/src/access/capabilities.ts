export const PLATFORM_CAPABILITIES = [
  "platform.users.read",
  "platform.organizations.read",
  "platform.audit.read",
  "platform.impersonation.start",
  "platform.impersonation.end",
  "platform.break_glass.start",
] as const;
export type PlatformCapability = (typeof PLATFORM_CAPABILITIES)[number];
