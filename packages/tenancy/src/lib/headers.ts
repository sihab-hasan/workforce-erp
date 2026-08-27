import type { TenantScope } from "@workforce-erp/contracts";
export function tenantScopeHeaders(scope?: TenantScope | null): Record<string, string> {
  if (!scope) return {};
  return {
    "X-Tenant-Key": scope.tenantKey,
    ...(scope.companyKey ? { "X-Company-Key": scope.companyKey } : {}),
  };
}
