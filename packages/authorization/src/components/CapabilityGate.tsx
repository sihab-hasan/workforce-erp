import type { ReactNode } from "react";
import type { Permission } from "@workforce-erp/contracts";
import { useAuthorization } from "../hooks/use-authorization";
export function CapabilityGate({
  capability,
  anyOf,
  allOf,
  children,
  fallback = null,
}: {
  capability?: Permission;
  anyOf?: readonly Permission[];
  allOf?: readonly Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const authz = useAuthorization();
  const allowed = capability
    ? authz.can(capability)
    : anyOf
      ? authz.canAny(anyOf)
      : allOf
        ? authz.canAll(allOf)
        : true;
  return allowed ? children : fallback;
}
