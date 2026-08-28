import { ERP_PATHS } from "#routes/paths";

export const AUTH_PATHS = {
  login: ERP_PATHS.signIn,
  signUp: ERP_PATHS.signUp,
  verifyEmail: ERP_PATHS.verifyEmail,
  verifySignIn: ERP_PATHS.verifySignIn,
  verifyPhone: ERP_PATHS.verifyPhone,
  forgotPassword: ERP_PATHS.forgotPassword,
  resetPassword: ERP_PATHS.resetPassword,
  ssoCallback: ERP_PATHS.ssoCallback,
  signOut: ERP_PATHS.signOut,
} as const;

export type AuthPath = (typeof AUTH_PATHS)[keyof typeof AUTH_PATHS];

export function safeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return ERP_PATHS.tenantSelect;
  const publicAuthPrefixes = [
    ERP_PATHS.signIn,
    ERP_PATHS.signUp,
    ERP_PATHS.verifyEmail,
    ERP_PATHS.verifySignIn,
    ERP_PATHS.forgotPassword,
    ERP_PATHS.resetPassword,
    "/sso/callback/",
    "/accept-invitation/",
  ];
  if (publicAuthPrefixes.some((prefix) => value.startsWith(prefix))) return ERP_PATHS.tenantSelect;
  return value;
}
