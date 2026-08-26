import { ERP_PATHS } from "#routes/paths";

/** Canonical browser paths for authentication in the minimized ERP. */
export const AUTH_PATHS = {
  login: ERP_PATHS.signIn,
  forgotPassword: ERP_PATHS.forgotPassword,
  resetPassword: ERP_PATHS.resetPassword,
  mfaChallenge: ERP_PATHS.mfa,
  ssoCallback: "/auth/callback/:provider",
  signOut: ERP_PATHS.signOut,
} as const;

export type AuthPath = (typeof AUTH_PATHS)[keyof typeof AUTH_PATHS];

export function safeReturnTo(value: string | null | undefined): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith(`${ERP_PATHS.auth}/`)
  ) {
    return ERP_PATHS.tenantSelect;
  }

  return value;
}
