import type { AuthSession } from "@workforce-erp/auth";
import type { AdminAuthUser } from "#lib/api";
import { isPlatformRole, type PlatformRole } from "#access/roles";

export type AuthorizedAdminUser = AdminAuthUser & { role: PlatformRole };

export function isAdminUser(user: AdminAuthUser): user is AuthorizedAdminUser {
  return isPlatformRole(user.role);
}

export function toAdminSession(user: AuthorizedAdminUser): AuthSession {
  const { organization_id: organizationId, organization_name: organizationName } = user;

  return {
    user: {
      id: String(user.id),
      email: user.email,
      name: user.name,
      displayName: user.name,
      role: user.role,
      ...(organizationId !== undefined ? { organizationId } : {}),
      ...(organizationName !== undefined ? { organizationName } : {}),
    },
  };
}
