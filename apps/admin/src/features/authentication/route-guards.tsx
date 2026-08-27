import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@workforce-erp/auth";
import { ADMIN_PATHS } from "#routes/paths";

export function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) return <>{children}</>;

  const from = `${location.pathname}${location.search}${location.hash}`;
  return <Navigate to={ADMIN_PATHS.signIn} replace state={{ from }} />;
}

export function AdminAnonymousOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to={ADMIN_PATHS.dashboard} replace /> : <>{children}</>;
}
