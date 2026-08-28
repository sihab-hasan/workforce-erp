import type { AuthSession } from "@workforce-erp/auth";
import type { Permission } from "@workforce-erp/contracts";
import { apiClient } from "#lib/api";

export type SsoProvider = "google" | "microsoft";
export type VerificationMethod = "totp" | "email" | "sms";

export interface AuthUserPayload {
  id: number | string;
  name: string;
  email: string;
  phone?: string | null;
  role?: string | null;
  roles?: string[];
  permissions?: Permission[];
  scopes?: Array<{ scope: string; data?: unknown }>;
  platform_roles?: string[];
  connected_sso?: Array<{ provider: string; email?: string | null }>;
  organization_id?: string | null;
  organization_name?: string | null;
  email_verified?: boolean;
  phone_verified?: boolean;
}

export interface VerificationChallengePayload {
  id: string;
  purpose: string;
  available_methods: VerificationMethod[];
  selected_method: VerificationMethod | null;
  expires_at: string | null;
  resend_available_at: string | null;
  client: "erp" | "admin" | string;
}

export type AuthBeginResponse =
  | { success: true; status: "authenticated"; user: AuthUserPayload }
  | {
      success: true;
      status: "verification_required";
      challenge: VerificationChallengePayload;
    };

export interface AuthSessionRecord {
  id: string;
  name: string;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: string | null;
  last_used_at: string | null;
  expires_at?: string | null;
  authentication_method?: string | null;
  current: boolean;
  kind?: "browser";
}

export interface AuthContextPayload {
  user: AuthUserPayload;
  tenant: null | {
    id: string;
    slug: string;
    name: string;
    status: string;
    subscription_status?: string | null;
    plan?: string | null;
  };
  membership: null | { id: string; status: string; data_scope: string };
  roles: string[];
  permissions: Permission[];
  scopes: Array<{ scope: string; data?: unknown }>;
  verification: {
    email: boolean;
    phone: boolean;
    authenticator: boolean;
    required: boolean;
  };
  session: null | {
    authentication_method?: string | null;
    mfa_level?: string | null;
    recent_verified_at?: string | null;
    absolute_expires_at?: string | null;
    client?: string | null;
  };
}

export interface RegistrationStartResponse {
  success: true;
  status: "verification_required";
  challenge: {
    id: string;
    purpose: "email_verification";
    expires_at: string;
    resend_available_at: string | null;
  };
}

export type RegistrationVerifyResponse =
  | {
      success: true;
      status: "authenticated";
      next: string;
      user: AuthUserPayload;
      organization: { id: string; slug: string; name: string };
    }
  | {
      success: true;
      status: "verification_required";
      next: string;
      challenge: VerificationChallengePayload;
      organization: { id: string; slug: string; name: string };
    };

export type InvitationAcceptResponse =
  | {
      success: true;
      status: "accepted" | "authenticated";
      user: AuthUserPayload;
      organization: { id: string; slug: string; name: string };
    }
  | {
      success: true;
      status: "verification_required";
      challenge: VerificationChallengePayload;
      organization: { id: string; slug: string; name: string };
    };

export interface InvitationPreview {
  email: string;
  organization: { id: string; name: string };
  expires_at: string;
  identity_setup_required: boolean;
}

export function toAuthSession(response: { user: AuthUserPayload }): AuthSession {
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
    return apiClient.post<AuthBeginResponse>(
      "/api/v1/auth/login",
      { email, password, client: "erp" },
      { withAuth: false },
    );
  },
  logout: () => apiClient.post<{ success: boolean; message?: string }>("/api/v1/auth/logout"),
  logoutAll: () =>
    apiClient.post<{ success: boolean; message?: string }>("/api/v1/auth/logout-all"),
  me: () => apiClient.get<{ success: boolean; user: AuthUserPayload }>("/api/v1/auth/me"),
  context: (tenantKey?: string) =>
    apiClient.get<{ success: boolean; data: AuthContextPayload }>("/api/v1/auth/context", {
      ...(tenantKey ? { headers: { "X-Tenant-Key": tenantKey } } : {}),
    }),
  sessions: () =>
    apiClient.get<{ success: boolean; data: AuthSessionRecord[] }>("/api/v1/auth/sessions"),
  revokeSession: (id: string) =>
    apiClient.delete<{ success: boolean; message?: string }>(
      `/api/v1/auth/sessions/${encodeURIComponent(id)}`,
    ),
  revokeOtherSessions: () =>
    apiClient.post<{ success: boolean }>("/api/v1/auth/sessions/revoke-others"),
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
  beginStepUp: () =>
    apiClient.post<{ success: true; challenge: VerificationChallengePayload }>(
      "/api/v1/auth/step-up",
    ),
  verifyStepUpChallenge: (challengeId: string, code: string) =>
    apiClient.post<{ success: true; status: "verified"; authentication_method: string }>(
      `/api/v1/auth/challenges/${encodeURIComponent(challengeId)}/verify`,
      { purpose: "step_up", code },
    ),
  selectChallengeMethod: (challengeId: string, method: VerificationMethod) =>
    apiClient.post<{ success: true; challenge: VerificationChallengePayload }>(
      `/api/v1/auth/challenges/${encodeURIComponent(challengeId)}/method`,
      { method },
      { withAuth: false },
    ),
  resendChallenge: (challengeId: string) =>
    apiClient.post<{ success: true; challenge: VerificationChallengePayload }>(
      `/api/v1/auth/challenges/${encodeURIComponent(challengeId)}/resend`,
      undefined,
      { withAuth: false },
    ),
  verifyLoginChallenge: (challengeId: string, code: string) =>
    apiClient.post<{ success: true; status: "authenticated"; user: AuthUserPayload }>(
      `/api/v1/auth/challenges/${encodeURIComponent(challengeId)}/verify`,
      { purpose: "login", code },
      { withAuth: false },
    ),
  register: (payload: {
    name: string;
    email: string;
    organization_name: string;
    country: string;
    phone?: string;
    password: string;
    password_confirmation: string;
    terms: boolean;
  }) =>
    apiClient.post<RegistrationStartResponse>(
      "/api/v1/auth/register",
      { ...payload, terms_accepted: payload.terms, client: "erp" },
      { withAuth: false },
    ),
  resendRegistration: (challengeId: string) =>
    apiClient.post<{ success: true; message: string }>(
      `/api/v1/auth/registrations/${encodeURIComponent(challengeId)}/resend`,
      undefined,
      { withAuth: false },
    ),
  verifyRegistration: (challengeId: string, code: string) =>
    apiClient.post<RegistrationVerifyResponse>(
      `/api/v1/auth/registrations/${encodeURIComponent(challengeId)}/verify`,
      { code },
      { withAuth: false },
    ),
  invitation: (token: string) =>
    apiClient.get<{ success: true; data: InvitationPreview }>(
      `/api/v1/auth/invitations/${encodeURIComponent(token)}`,
      { withAuth: false },
    ),
  acceptInvitation: (
    token: string,
    payload: { password?: string; password_confirmation?: string } = {},
  ) =>
    apiClient.post<InvitationAcceptResponse>(
      `/api/v1/auth/invitations/${encodeURIComponent(token)}/accept`,
      payload,
      {
        withAuth: false,
      },
    ),
  onboarding: (tenantKey: string) =>
    apiClient.get<{
      success: true;
      data: {
        status: string;
        step: string;
        data: Record<string, Record<string, unknown>>;
        steps: string[];
        step_status: Record<string, { status: string; completed_at?: string | null }>;
        modules: Record<string, string>;
        roles: Array<{ name: string; description?: string | null }>;
      };
    }>("/api/v1/onboarding", { headers: { "X-Tenant-Key": tenantKey } }),
  saveOnboarding: (
    tenantKey: string,
    step: string,
    data: Record<string, unknown>,
    shouldContinue = true,
    skip = false,
  ) =>
    apiClient.put<{
      success: true;
      data: { status: string; step: string; data: Record<string, Record<string, unknown>> };
    }>(
      `/api/v1/onboarding/${encodeURIComponent(step)}`,
      { data, continue: shouldContinue, skip },
      { headers: { "X-Tenant-Key": tenantKey } },
    ),
  authenticators: () =>
    apiClient.get<{
      success: true;
      data: Array<{ id: string; label: string; confirmed_at: string }>;
    }>("/api/v1/auth/authenticator"),
  beginAuthenticator: () =>
    apiClient.post<{
      success: true;
      data: { factor_id: string; secret: string; otpauth_uri: string };
    }>("/api/v1/auth/authenticator"),
  confirmAuthenticator: (factorId: string, code: string) =>
    apiClient.post<{ success: true; message: string }>(
      `/api/v1/auth/authenticator/${encodeURIComponent(factorId)}/confirm`,
      { code },
    ),
  removeAuthenticator: (factorId: string) =>
    apiClient.delete<{ success: true; message: string }>(
      `/api/v1/auth/authenticator/${encodeURIComponent(factorId)}`,
    ),
  requestPhoneChange: (phone: string) =>
    apiClient.post<{ success: true; challenge: { id: string; expires_at: string | null } }>(
      "/api/v1/auth/phone/change",
      { phone },
    ),
  confirmPhoneChange: (challengeId: string, code: string) =>
    apiClient.post<{ success: true; message?: string }>(
      `/api/v1/auth/phone/change/${encodeURIComponent(challengeId)}/confirm`,
      { code },
    ),
  getSsoRedirect: (provider: SsoProvider) =>
    apiClient.get<{ success: boolean; redirect_url: string; state: string }>(
      `/api/v1/auth/sso/redirect/${provider}`,
      { params: { client: "erp" }, withAuth: false },
    ),
  completeSso: (provider: SsoProvider, code: string, state: string) =>
    apiClient.post<AuthBeginResponse>(
      `/api/v1/auth/sso/callback/${provider}`,
      { code, state, client: "erp" },
      { withAuth: false },
    ),
};
