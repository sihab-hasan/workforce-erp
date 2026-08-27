import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { AuthSession } from "../types/auth.types";
import { AuthContext, type AuthContextValue } from "./AuthContext";

type AuthProviderProps = {
  children: ReactNode;
  initialSession?: AuthSession | null;
};

export function AuthProvider({ children, initialSession = null }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(initialSession);

  const signIn = useCallback((nextSession: AuthSession) => {
    setSession(nextSession);
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      status: session ? "authenticated" : "anonymous",
      isAuthenticated: session !== null,
      signIn,
      signOut,
    }),
    [session, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
