import { useEffect, useState, type ReactNode } from "react";
import { AuthProvider, useAuth, type AuthSession } from "@workforce-erp/auth";
import { Loader2 } from "lucide-react";
import { apiClient, ADMIN_AUTH_UNAUTHORIZED_EVENT } from "#lib/api";
import { isAdminUser, toAdminSession } from "./admin-auth";

function UnauthorizedListener() {
  const { signOut } = useAuth();
  useEffect(() => {
    const handle = () => void signOut();
    window.addEventListener(ADMIN_AUTH_UNAUTHORIZED_EVENT, handle);
    return () => window.removeEventListener(ADMIN_AUTH_UNAUTHORIZED_EVENT, handle);
  }, [signOut]);
  return null;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [initialSession, setInitialSession] = useState<AuthSession | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void apiClient
      .me()
      .then(async ({ user }) => {
        if (cancelled) return;
        if (!isAdminUser(user)) {
          await apiClient.logout().catch(() => undefined);
          return;
        }
        setInitialSession(toAdminSession(user));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setBooting(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Restoring admin session…
      </div>
    );
  }

  return (
    <AuthProvider initialSession={initialSession}>
      <UnauthorizedListener />
      {children}
    </AuthProvider>
  );
}
