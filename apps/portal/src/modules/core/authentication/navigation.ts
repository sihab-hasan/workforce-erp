/** Canonical browser paths for every authentication screen. */
export const AUTH_PATHS = {
  login: "/auth/login",
  register: "/auth/register",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  verifyEmail: "/auth/verify-email",
  mfaChallenge: "/auth/mfa",
} as const

export type AuthPath = (typeof AUTH_PATHS)[keyof typeof AUTH_PATHS]
