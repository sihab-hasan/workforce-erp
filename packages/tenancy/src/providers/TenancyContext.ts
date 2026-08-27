import { createContext } from "react";
import type { CompanyReference, TenantReference, TenantScope } from "@workforce-erp/contracts";

export interface TenancyValue {
  tenant: TenantReference | null;
  company: CompanyReference | null;
  tenants: readonly TenantReference[];
  companies: readonly CompanyReference[];
  selectTenant?(tenant: TenantReference): void | Promise<void>;
  selectCompany?(company: CompanyReference | null): void | Promise<void>;
  scope: TenantScope | null;
}

export const TenancyContext = createContext<TenancyValue | null>(null);
