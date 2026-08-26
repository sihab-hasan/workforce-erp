import type { ReactNode } from "react";
import type { Permission } from "@workforce-erp/contracts";
import { CapabilityGate } from "../components/CapabilityGate";

export function CapabilityGuard({
  capability,
  children,
  fallback = null,
}: {
  capability: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <CapabilityGate capability={capability} fallback={fallback}>
      {children}
    </CapabilityGate>
  );
}
