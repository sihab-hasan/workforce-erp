import { useEffect, useRef, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAuth } from "@workforce-erp/auth";
import type { Permission } from "@workforce-erp/contracts";
import { AuthorizationProvider } from "@workforce-erp/authorization/provider";
import { ThemeProvider } from "@workforce-erp/ui/providers/theme-provider";
import { AdminAuthProvider } from "#features/authentication/AdminAuthProvider";
import { apiClient } from "#lib/api";
function SessionAuthorizationProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [p, setP] = useState<readonly Permission[]>([]);
  const userId = session?.user.id;
  useEffect(() => {
    let c = false;
    if (!userId) {
      setP([]);
      return;
    }
    void apiClient
      .platformContext()
      .then((r) => {
        if (!c) setP(r.data.permissions ?? []);
      })
      .catch(() => {
        if (!c) setP([]);
      });
    return () => {
      c = true;
    };
  }, [userId]);
  return <AuthorizationProvider permissions={p}>{children}</AuthorizationProvider>;
}
function SessionCacheBoundary({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const q = useQueryClient();
  const prev = useRef<string | null | undefined>(undefined);
  const id = session?.user.id ?? null;
  useEffect(() => {
    if (prev.current !== undefined && prev.current !== id) q.clear();
    prev.current = id;
  }, [id, q]);
  return children;
}
export function AppProviders({ children }: { children: ReactNode }) {
  const [q] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 300000, retry: 1, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
      }),
  );
  return (
    <ThemeProvider>
      <QueryClientProvider client={q}>
        <AdminAuthProvider>
          <SessionCacheBoundary>
            <SessionAuthorizationProvider>
              {children}
              <Toaster richColors closeButton />
            </SessionAuthorizationProvider>
          </SessionCacheBoundary>
        </AdminAuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
