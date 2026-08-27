export type SessionStatus = "anonymous" | "authenticated";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  /** Compatibility alias retained for the minimized shell components. */
  displayName?: string;
  role?: string | null;
  organizationId?: string | null;
  organizationName?: string | null;
};

/**
 * Browser authentication is backed by Laravel Sanctum's HttpOnly session
 * cookie. No credential is exposed to or persisted by the auth provider.
 */
export type AuthSession = {
  user: AuthUser;
};
