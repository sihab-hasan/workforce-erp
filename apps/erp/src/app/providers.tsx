import { useEffect, useRef, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAuth } from "@workforce-erp/auth";
import type { Permission } from "@workforce-erp/contracts";
import { AuthorizationProvider } from "@workforce-erp/authorization/provider";
import { ThemeProvider } from "@workforce-erp/ui/providers/theme-provider";
import { AppAuthProvider } from "#features/authentication/AppAuthProvider";
import { authenticationApi } from "#features/authentication/api/authentication.api";

const LOCATION_EVENT = "workforce-erp:location-change";

function installHistoryEvents() {
  if (
    typeof window === "undefined" ||
    (window as Window & { __workforceHistoryEvents?: boolean }).__workforceHistoryEvents
  )
    return;
  (window as Window & { __workforceHistoryEvents?: boolean }).__workforceHistoryEvents = true;
  for (const key of ["pushState", "replaceState"] as const) {
    const original = history[key].bind(history);
    history[key] = (data: unknown, unused: string, url?: string | URL | null) => {
      const result = original(data, unused, url);
      window.dispatchEvent(new Event(LOCATION_EVENT));
      return result;
    };
  }
}

function currentTenant(): string | undefined {
  const tenant = window.location.pathname.match(/^\/t\/([^/]+)/)?.[1];
  return tenant ? decodeURIComponent(tenant) : undefined;
}

function SessionAuthorizationProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [permissions, setPermissions] = useState<readonly Permission[]>([]);
  const userId = session?.user.id;

  useEffect(() => {
    installHistoryEvents();
    let cancelled = false;
    const load = async () => {
      if (!userId) {
        setPermissions([]);
        return;
      }
      try {
        const response = await authenticationApi.context(currentTenant());
        if (!cancelled) setPermissions(response.data.permissions ?? []);
      } catch {
        if (!cancelled) setPermissions([]);
      }
    };
    const onLocation = () => void load();
    void load();
    window.addEventListener(LOCATION_EVENT, onLocation);
    window.addEventListener("popstate", onLocation);
    return () => {
      cancelled = true;
      window.removeEventListener(LOCATION_EVENT, onLocation);
      window.removeEventListener("popstate", onLocation);
    };
  }, [userId]);

  return <AuthorizationProvider permissions={permissions}>{children}</AuthorizationProvider>;
}

function SessionCacheBoundary({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const previousUserId = useRef<string | null | undefined>(undefined);
  const currentUserId = session?.user.id ?? null;
  useEffect(() => {
    if (previousUserId.current !== undefined && previousUserId.current !== currentUserId)
      queryClient.clear();
    previousUserId.current = currentUserId;
  }, [currentUserId, queryClient]);
  return children;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
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
      <QueryClientProvider client={queryClient}>
        <AppAuthProvider>
          <SessionCacheBoundary>
            <SessionAuthorizationProvider>
              {children}
              <Toaster richColors closeButton />
            </SessionAuthorizationProvider>
          </SessionCacheBoundary>
        </AppAuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
