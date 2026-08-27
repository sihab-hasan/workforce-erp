import type { ReactNode } from "react";
import { useTenancy } from "../hooks/use-tenancy";
export function TenantGuard({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return useTenancy().tenant ? children : fallback;
}
export function CompanyGuard({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return useTenancy().company ? children : fallback;
}
