import { createBrowserRouter, Link, Navigate } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workforce-erp/ui/components/empty";
import { AdminLayout } from "#layouts/AdminLayout";
import { AdminProtectedRoute } from "#features/authentication/route-guards";
import { authRoutes } from "#routes/auth.routes";
import { dashboardRoutes } from "#routes/dashboard.routes";
import { tenantRoutes } from "#routes/tenants.routes";
import { organizationRoutes } from "#routes/organizations.routes";
import { userRoutes } from "#routes/users.routes";
import { roleRoutes } from "#routes/roles.routes";
import { settingsRoutes } from "#routes/settings.routes";
import { ADMIN_PATHS } from "#routes/paths";
import { RouteMetadata } from "#components/metadata/RouteMetadata";

function AdminNotFound({ insideShell = false }: { insideShell?: boolean }) {
  const content = (
    <>
      <RouteMetadata />
      <Empty className="min-h-72 rounded-2xl border border-dashed bg-muted/15 px-6">
        <EmptyHeader>
          <EmptyTitle>Admin page not found</EmptyTitle>
          <EmptyDescription>
            This URL does not match a registered platform administration page.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row flex-wrap justify-center">
          <Button nativeButton={false} render={<Link to={ADMIN_PATHS.dashboard} />}>
            Back to dashboard
          </Button>
        </EmptyContent>
      </Empty>
    </>
  );

  return insideShell ? (
    content
  ) : (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-6">{content}</main>
  );
}

export const router = createBrowserRouter(
  [
    { path: "/", element: <Navigate to={ADMIN_PATHS.dashboard} replace /> },
    ...authRoutes,
    {
      path: "admin",
      element: (
        <AdminProtectedRoute>
          <AdminLayout />
        </AdminProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        ...dashboardRoutes,
        ...tenantRoutes,
        ...organizationRoutes,
        ...userRoutes,
        ...roleRoutes,
        ...settingsRoutes,
        { path: "*", element: <AdminNotFound insideShell /> },
      ],
    },
    { path: "*", element: <AdminNotFound /> },
  ],
  { basename: import.meta.env.BASE_URL },
);
