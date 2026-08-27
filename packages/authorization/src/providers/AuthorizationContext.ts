import { createContext } from "react";
import type { Permission, PolicyDecision, PolicyRequest } from "@workforce-erp/contracts";

export type PolicyEvaluator = (request: PolicyRequest) => PolicyDecision | Promise<PolicyDecision>;

export interface AuthorizationValue {
  permissions: readonly Permission[];
  can(permission: Permission): boolean;
  canAny(permissions: readonly Permission[]): boolean;
  canAll(permissions: readonly Permission[]): boolean;
  evaluate?: PolicyEvaluator;
}

export const AuthorizationContext = createContext<AuthorizationValue | null>(null);
