import type { AuthSession } from "@workforce-erp/auth";
import type { PlatformContext } from "#lib/api";
import { isPlatformRole } from "#access/roles";
export function toAdminSession(context: PlatformContext): AuthSession {
  const role = context.platform_roles.find(isPlatformRole) ?? null;
  return {
    user: {
      id: String(context.user.id),
      email: context.user.email,
      name: context.user.name,
      displayName: context.user.name,
      role,
    },
  };
}
