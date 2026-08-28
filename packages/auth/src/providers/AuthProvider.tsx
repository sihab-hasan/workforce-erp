import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthSession } from "../types/auth.types";
import { AuthContext, type AuthContextValue } from "./AuthContext";

type AuthProviderProps = {
  children: ReactNode;
  initialSession?: AuthSession | null;
  onSessionChange?: (session: AuthSession | null) => void;
};

export function AuthProvider({
  children,
  initialSession = null,
  onSessionChange,
}: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(initialSession);

  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  const signIn = useCallback(
    (nextSession: AuthSession) => {
      setSession(nextSession);
      onSessionChange?.(nextSession);
    },
    [onSessionChange],
  );

  const signOut = useCallback(() => {
    setSession(null);
    onSessionChange?.(null);
  }, [onSessionChange]);

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
