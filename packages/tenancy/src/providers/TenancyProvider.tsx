import { useMemo, type PropsWithChildren } from "react";
import type { CompanyReference, TenantReference, TenantScope } from "@workforce-erp/contracts";
import { TenancyContext, type TenancyValue } from "./TenancyContext";

type TenancyProviderProps = PropsWithChildren<{
  tenant: TenantReference | null;
  company: CompanyReference | null;
  tenants?: readonly TenantReference[];
  companies?: readonly CompanyReference[];
  selectTenant?: (tenant: TenantReference) => void | Promise<void>;
  selectCompany?: (company: CompanyReference | null) => void | Promise<void>;
}>;

export function TenancyProvider({
  tenant,
  company,
  tenants = [],
  companies = [],
  selectTenant,
  selectCompany,
  children,
}: TenancyProviderProps) {
  const scope = useMemo<TenantScope | null>(
    () =>
      tenant
        ? {
            tenantKey: tenant.key,
            ...(company ? { companyKey: company.key } : {}),
          }
        : null,
    [company, tenant],
  );

  const value = useMemo<TenancyValue>(
    () => ({
      tenant,
      company,
      tenants,
      companies,
      ...(selectTenant !== undefined ? { selectTenant } : {}),
      ...(selectCompany !== undefined ? { selectCompany } : {}),
      scope,
    }),
    [tenant, company, tenants, companies, selectTenant, selectCompany, scope],
  );

  return <TenancyContext.Provider value={value}>{children}</TenancyContext.Provider>;
}
