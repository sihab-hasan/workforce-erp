import type { AuthSession } from "@workforce-erp/auth";
import { apiClient } from "#lib/api";

export type SsoProvider = "google" | "microsoft";

export interface AuthUserPayload {
  id: number | string;
  name: string;
  email: string;
  role?: string | null;
  organization_id?: string | null;
  organization_name?: string | null;
  sso_provider?: string | null;
}

export interface AuthSuccessResponse {
  success: boolean;
  user: AuthUserPayload;
  message?: string;
}

export interface AuthSessionRecord {
  id: string;
  name: string;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: string | null;
  last_used_at: string | null;
  expires_at?: string | null;
  current: boolean;
  kind?: "browser" | "api_token";
}

export function toAuthSession(response: Pick<AuthSuccessResponse, "user">): AuthSession {
  const {
    role,
    organization_id: organizationId,
    organization_name: organizationName,
  } = response.user;

  return {
    user: {
      id: String(response.user.id),
      name: response.user.name,
      email: response.user.email,
      ...(role !== undefined ? { role } : {}),
      ...(organizationId !== undefined ? { organizationId } : {}),
      ...(organizationName !== undefined ? { organizationName } : {}),
    },
  };
}

export const authenticationApi = {
  csrf: () => apiClient.csrf(),
  login(email: string, password: string) {
    return apiClient.post<AuthSuccessResponse>(
      "/api/v1/auth/login",
      { email, password, client: "portal" },
      { withAuth: false },
    );
  },
  logout: () => apiClient.post<{ success: boolean; message?: string }>("/api/v1/auth/logout"),
  logoutAll: () =>
    apiClient.post<{ success: boolean; message?: string }>("/api/v1/auth/logout-all"),
  me: () => apiClient.get<{ success: boolean; user: AuthUserPayload }>("/api/v1/auth/me"),
  sessions: () =>
    apiClient.get<{ success: boolean; data: AuthSessionRecord[] }>("/api/v1/auth/sessions"),
  revokeSession: (id: string) =>
    apiClient.delete<{ success: boolean; message?: string }>(
      `/api/v1/auth/sessions/${encodeURIComponent(id)}`,
    ),
  requestPasswordReset: (email: string) =>
    apiClient.post<{ success: boolean; message?: string }>(
      "/api/v1/auth/password/forgot",
      { email },
      { withAuth: false },
    ),
  resetPassword: (payload: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
  }) =>
    apiClient.post<{ success: boolean; message?: string }>("/api/v1/auth/password/reset", payload, {
      withAuth: false,
    }),
  changePassword: (payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) =>
    apiClient.post<{ success: boolean; message?: string }>("/api/v1/auth/password/change", payload),
  requestOtp: (email: string) =>
    apiClient.post<{ success: boolean; message?: string }>(
      "/api/v1/auth/otp/request",
      { email },
      { withAuth: false },
    ),
  verifyOtp: (email: string, code: string) =>
    apiClient.post<AuthSuccessResponse>(
      "/api/v1/auth/otp/verify",
      { email, code, client: "portal" },
      { withAuth: false },
    ),
  getSsoRedirect: (provider: SsoProvider) =>
    apiClient.get<{ success: boolean; redirect_url: string; state: string }>(
      `/api/v1/auth/sso/redirect/${provider}`,
      { withAuth: false },
    ),
  completeSso: (provider: SsoProvider, code: string, state: string) =>
    apiClient.post<AuthSuccessResponse>(
      `/api/v1/auth/sso/callback/${provider}`,
      { code, state },
      { withAuth: false },
    ),
};
