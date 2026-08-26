import type { ReactNode } from "react";
import { RequireAuth } from "./RequireAuth";

/** Mini-codebase compatibility name for the big-version RequireAuth guard. */
export function AuthGuard({
  children,
  fallback = null,
}: {
  children: ReactNode;
  loading?: ReactNode;
  fallback?: ReactNode;
}) {
  return <RequireAuth fallback={fallback}>{children}</RequireAuth>;
}
