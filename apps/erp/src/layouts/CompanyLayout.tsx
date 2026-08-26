import { useMemo } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { useAuth } from "@workforce-erp/auth";
import { TenancyProvider } from "@workforce-erp/tenancy/provider";
import type { CompanyReference, TenantReference } from "@workforce-erp/contracts";
import { SidebarInset, SidebarProvider } from "@workforce-erp/ui/components/sidebar";
import { AppHeader } from "#components/shell/AppHeader";
import { AppSidebar } from "#components/shell/AppSidebar";
import { AppMobileNavigation } from "#components/shell/AppMobileNavigation";
import { RouteMetadata } from "#components/metadata/RouteMetadata";

/** Big-version PortalLayout presentation mapped onto the mini company scope. */
export function CompanyLayout() {
  const { pathname } = useLocation();
  const { tenantKey, companyKey } = useParams();
  const { session } = useAuth();

  const tenant = useMemo<TenantReference | null>(() => {
    if (!tenantKey) return null;
    const organizationMatches = String(session?.user.organizationId ?? "") === tenantKey;
    return {
      id: tenantKey,
      key: tenantKey,
      name:
        organizationMatches && session?.user.organizationName
          ? session.user.organizationName
          : tenantKey,
      status: "active",
    };
  }, [session?.user.organizationId, session?.user.organizationName, tenantKey]);

  const company = useMemo<CompanyReference | null>(() => {
    if (!tenant || !companyKey) return null;
    return {
      id: companyKey,
      tenantId: tenant.id,
      key: companyKey,
      name: companyKey,
      status: "active",
    };
  }, [companyKey, tenant]);

  return (
    <TenancyProvider
      tenant={tenant}
      company={company}
      tenants={tenant ? [tenant] : []}
      companies={company ? [company] : []}
    >
      <SidebarProvider defaultOpen={true}>
        <RouteMetadata />
        <AppSidebar />
        <SidebarInset className="min-h-screen overflow-x-hidden bg-background">
          <AppHeader />
          <main className="flex-1 px-4 py-5 pb-24 md:px-6 md:py-7 md:pb-7 lg:px-8">
            <div className="mx-auto w-full">
              <Outlet />
            </div>
          </main>
          <AppMobileNavigation currentPath={pathname} />
        </SidebarInset>
      </SidebarProvider>
    </TenancyProvider>
  );
}
