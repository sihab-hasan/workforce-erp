export type SessionStatus = "anonymous" | "authenticated"

export type AuthUser = {
  id: string
  email: string
  name: string
  role?: string | null
  organizationId?: string | null
  organizationName?: string | null
}

/**
 * First-party browser authentication is backed by Laravel's HttpOnly session
 * cookie. No credential is exposed to or persisted by JavaScript.
 */
export type AuthSession = {
  user: AuthUser
}
