export const PLATFORM_CAPABILITIES = [
  "tenant.manage",
  "organization.view",
  "user.manage",
  "role.manage",
  "settings.manage",
] as const;
export type PlatformCapability = (typeof PLATFORM_CAPABILITIES)[number];
