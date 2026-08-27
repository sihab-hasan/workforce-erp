import { env } from "./env";

export const portalLinks = {
  login: `${env.erpUrl}/auth/sign-in`,
  forgotPassword: `${env.erpUrl}/auth/forgot-password`,
} as const;
