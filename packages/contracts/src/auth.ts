import type { EntityId, ISODateTimeString } from "./common";
export interface AuthUser {
  id: EntityId;
  email?: string;
  /** Canonical display name used by the minimized codebase. */
  displayName?: string;
  /** Compatibility alias used by the migrated Laravel portal code. */
  name?: string;
  avatarUrl?: string;
  role?: string | null;
  organizationId?: string | null;
  organizationName?: string | null;
}
export interface AuthSession {
  user: AuthUser;
  accessToken?: string;
  expiresAt?: ISODateTimeString;
  authenticatedAt?: ISODateTimeString;
  claims?: Record<string, unknown>;
}
export type AuthStatus = "loading" | "authenticated" | "anonymous" | "error";
