import { createCookieApiClient } from "@workforce-erp/api-client/compat";
import type { Permission } from "@workforce-erp/contracts";
import { env } from "#config/env";

export const ADMIN_AUTH_UNAUTHORIZED_EVENT = "workforce-erp:admin-auth-unauthorized";

let stepUpHandler: (() => Promise<void>) | null = null;
let stepUpInFlight: Promise<void> | null = null;

export function registerAdminStepUpHandler(handler: () => Promise<void>) {
  stepUpHandler = handler;
  return () => {
    if (stepUpHandler === handler) stepUpHandler = null;
  };
}

async function handleAdminStepUpRequired() {
  if (!stepUpHandler) throw new Error("Identity verification is required for this action.");
  if (!stepUpInFlight) {
    stepUpInFlight = stepUpHandler().finally(() => {
      stepUpInFlight = null;
    });
  }
  await stepUpInFlight;
}
export type VerificationMethod = "totp" | "email" | "sms";
export type AdminAuthUser = {
  id: string | number;
  name: string;
  email: string;
  role?: string | null;
  platform_roles?: string[];
};
export type AdminChallenge = {
  id: string;
  purpose: string;
  available_methods: VerificationMethod[];
  selected_method: VerificationMethod | null;
  expires_at: string | null;
  resend_available_at: string | null;
  client: string;
};
export type AdminAuthBegin =
  | { success: true; status: "authenticated"; user: AdminAuthUser }
  | { success: true; status: "verification_required"; challenge: AdminChallenge };
export type PlatformContext = {
  user: { id: string; name: string; email: string };
  platform_roles: string[];
  permissions: Permission[];
  session: {
    authentication_method?: string | null;
    mfa_level?: string | null;
    recent_verified_at?: string | null;
  };
};
export function handleUnauthorized() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ADMIN_AUTH_UNAUTHORIZED_EVENT));
}

const client = createCookieApiClient({
  baseUrl: env.apiBaseUrl,
  onUnauthorized: handleUnauthorized,
  onStepUpRequired: handleAdminStepUpRequired,
});
export const apiClient = {
  getHealth: () => client.getHealth(),
  login: (email: string, password: string) =>
    client.post<AdminAuthBegin>(
      "/api/v1/auth/login",
      { email, password, client: "admin" },
      { withAuth: false },
    ),
  selectChallengeMethod: (id: string, method: VerificationMethod) =>
    client.post<{ success: true; challenge: AdminChallenge }>(
      `/api/v1/auth/challenges/${encodeURIComponent(id)}/method`,
      { method },
      { withAuth: false },
    ),
  resendChallenge: (id: string) =>
    client.post<{ success: true; challenge: AdminChallenge }>(
      `/api/v1/auth/challenges/${encodeURIComponent(id)}/resend`,
      undefined,
      { withAuth: false },
    ),
  verifyChallenge: (id: string, code: string) =>
    client.post<{ success: true; status: "authenticated"; user: AdminAuthUser }>(
      `/api/v1/auth/challenges/${encodeURIComponent(id)}/verify`,
      { purpose: "login", code },
      { withAuth: false },
    ),
  me: () => client.get<{ success: boolean; user: AdminAuthUser }>("/api/v1/auth/me"),
  platformContext: () =>
    client.get<{ success: true; data: PlatformContext }>("/api/v1/platform/context"),
  beginStepUp: () =>
    client.post<{ success: true; challenge: AdminChallenge }>("/api/v1/auth/step-up"),
  verifyStepUp: (id: string, code: string) =>
    client.post<{ success: true; status: "verified"; authentication_method: string }>(
      `/api/v1/auth/challenges/${encodeURIComponent(id)}/verify`,
      { purpose: "step_up", code },
    ),
  logout: () => client.post<{ success: boolean; message?: string }>("/api/v1/auth/logout"),
};
