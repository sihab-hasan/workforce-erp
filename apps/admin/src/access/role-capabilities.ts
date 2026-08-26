import { PLATFORM_CAPABILITIES, type PlatformCapability } from "#access/capabilities";
import type { PlatformRole } from "#access/roles";

export const PLATFORM_ROLE_CAPABILITIES: Record<PlatformRole, readonly PlatformCapability[]> = {
  owner: PLATFORM_CAPABILITIES,
  admin: PLATFORM_CAPABILITIES,
};
