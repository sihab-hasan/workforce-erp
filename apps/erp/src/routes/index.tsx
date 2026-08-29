import { createBrowserRouter, Link, Navigate } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workforce-erp/ui/components/empty";
import { authRoutes } from "#routes/auth.routes";
import { tenantRoutes } from "#routes/tenant.routes";
import { companyRoutes } from "#routes/company.routes";
import { ERP_PATHS } from "#routes/paths";
import { RouteMetadata } from "#components/metadata/RouteMetadata";

function AppNotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-16">
      <RouteMetadata />
      <Empty className="min-h-72 rounded-2xl border border-dashed bg-muted/15 px-6">
        <EmptyHeader>
          <EmptyTitle>Route not found</EmptyTitle>
          <EmptyDescription>
            This URL does not match a registered Workforce ERP page.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row flex-wrap justify-center">
          <Button nativeButton={false} render={<Link to={ERP_PATHS.tenantSelect} />}>
            Select organization
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}

export const router = createBrowserRouter(
  [
    { path: ERP_PATHS.root, element: <Navigate to={ERP_PATHS.tenantSelect} replace /> },
    ...authRoutes,
    ...tenantRoutes,
    ...companyRoutes,
    { path: "*", element: <AppNotFound /> },
  ],
  { basename: import.meta.env.BASE_URL },
);
