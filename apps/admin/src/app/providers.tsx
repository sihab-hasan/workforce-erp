import { useEffect, useRef, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAuth } from "@workforce-erp/auth";
import { AuthorizationProvider } from "@workforce-erp/authorization/provider";
import { ThemeProvider } from "@workforce-erp/ui/providers/theme-provider";
import { PLATFORM_ROLE_CAPABILITIES } from "#access/role-capabilities";
import { isPlatformRole } from "#access/roles";
import { AdminAuthProvider } from "#features/authentication/AdminAuthProvider";

function SessionAuthorizationProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const role = session?.user.role;
  const permissions = isPlatformRole(role) ? PLATFORM_ROLE_CAPABILITIES[role] : [];
  return <AuthorizationProvider permissions={permissions}>{children}</AuthorizationProvider>;
}

function SessionCacheBoundary({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const previousUserId = useRef<string | null | undefined>(undefined);
  const currentUserId = session?.user.id ?? null;

  useEffect(() => {
    if (previousUserId.current !== undefined && previousUserId.current !== currentUserId) {
      queryClient.clear();
    }
    previousUserId.current = currentUserId;
  }, [currentUserId, queryClient]);

  return children;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
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
