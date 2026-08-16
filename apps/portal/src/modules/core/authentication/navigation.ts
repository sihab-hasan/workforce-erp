/** Canonical browser paths for the real authentication surface. */
export const AUTH_PATHS = {
  login: "/auth/login",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  mfaChallenge: "/auth/mfa",
  ssoCallback: "/auth/callback/:provider",
} as const

export type AuthPath = (typeof AUTH_PATHS)[keyof typeof AUTH_PATHS]

export function safeReturnTo(value: string | null | undefined): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/auth/")
  ) {
    return "/"
  }

  return value
}
