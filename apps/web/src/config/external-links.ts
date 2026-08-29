import { env } from "./env";

export const portalLinks = {
  login: `${env.erpUrl}/sign-in`,
  forgotPassword: `${env.erpUrl}/forgot-password`,
} as const;
