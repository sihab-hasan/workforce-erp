import type { ReactNode } from "react";
import type { Permission } from "@workforce-erp/contracts";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@workforce-erp/auth";
import { useAuthorization } from "@workforce-erp/authorization";
import { AccessDenied } from "@workforce-erp/ui-patterns/feedback";
import { AUTH_PATHS, safeReturnTo } from "#features/authentication/navigation";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) return <>{children}</>;

  const returnTo = `${location.pathname}${location.search}${location.hash}`;
  return <Navigate to={`${AUTH_PATHS.login}?returnTo=${encodeURIComponent(returnTo)}`} replace />;
}

export function AnonymousOnly({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [searchParams] = useSearchParams();

  if (session) {
    return <Navigate to={safeReturnTo(searchParams.get("returnTo"))} replace />;
  }

  return <>{children}</>;
}

export function AuthorizedRoute({
  children,
  capability,
  anyOf,
  allOf,
}: {
  children: ReactNode;
  capability?: Permission;
  anyOf?: readonly Permission[];
  allOf?: readonly Permission[];
}) {
  const authorization = useAuthorization();
  const allowed = capability
    ? authorization.can(capability)
    : anyOf
      ? authorization.canAny(anyOf)
      : allOf
        ? authorization.canAll(allOf)
        : true;

  return allowed ? <>{children}</> : <AccessDenied onBack={() => window.history.back()} />;
}
