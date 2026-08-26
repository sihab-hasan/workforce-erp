import type { CompanyKey, EntityId, TenantKey } from "./common";
export interface TenantReference {
  id: EntityId;
  key: TenantKey;
  name: string;
  status?: "active" | "suspended" | "archived";
}
export interface CompanyReference {
  id: EntityId;
  tenantId: EntityId;
  key: CompanyKey;
  name: string;
  legalName?: string;
  status?: "active" | "inactive";
}
export interface TenantScope {
  tenantKey: TenantKey;
  companyKey?: CompanyKey;
}
