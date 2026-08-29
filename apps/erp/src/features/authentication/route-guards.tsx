import type { ReactNode } from "react";
import type { Permission } from "@workforce-erp/contracts";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@workforce-erp/auth";
import { useAuthorization } from "@workforce-erp/authorization";
import { Button } from "@workforce-erp/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workforce-erp/ui/components/empty";
import { AUTH_PATHS, safeReturnTo } from "#features/authentication/navigation";

function AccessDenied({ onBack }: { onBack?: () => void }) {
  return (
    <Empty className="min-h-[22rem] px-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <span aria-hidden="true">⛔</span>
        </EmptyMedia>
        <EmptyTitle>Access restricted</EmptyTitle>
        <EmptyDescription>
          You don't have permission to view this content. Request access from an administrator if you believe this is unexpected.
        </EmptyDescription>
      </EmptyHeader>
      {onBack ? (
        <EmptyContent className="flex-row justify-center">
          <Button variant="outline" onClick={onBack}>
            Go back
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}

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
