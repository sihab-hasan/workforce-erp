import { useMemo, type PropsWithChildren } from "react";
import type { Permission } from "@workforce-erp/contracts";
import { hasAllPermissions, hasAnyPermission, hasPermission } from "../lib/permissions";
import {
  AuthorizationContext,
  type AuthorizationValue,
  type PolicyEvaluator,
} from "./AuthorizationContext";

type AuthorizationProviderProps = PropsWithChildren<{
  permissions: readonly Permission[];
  evaluate?: PolicyEvaluator;
}>;

export function AuthorizationProvider({
  permissions,
  evaluate,
  children,
}: AuthorizationProviderProps) {
  const value = useMemo<AuthorizationValue>(
    () => ({
      permissions,
      ...(evaluate !== undefined ? { evaluate } : {}),
      can: (permission) => hasPermission(permissions, permission),
      canAny: (requiredPermissions) => hasAnyPermission(permissions, requiredPermissions),
      canAll: (requiredPermissions) => hasAllPermissions(permissions, requiredPermissions),
    }),
    [evaluate, permissions],
  );

  return <AuthorizationContext.Provider value={value}>{children}</AuthorizationContext.Provider>;
}
