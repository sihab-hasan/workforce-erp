import type { ReactNode } from "react";

export function ScopeGuard<TScope extends string>({
  current,
  allowed,
  children,
  fallback = null,
}: {
  current: TScope;
  allowed: readonly TScope[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return allowed.includes(current) ? children : fallback;
}
