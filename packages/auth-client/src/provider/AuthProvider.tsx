import { createContext, useMemo, useState, type ReactNode } from "react"
import type { AuthSession, SessionStatus } from "../types/auth.types"

export type AuthContextValue = {
  session: AuthSession | null
  status: SessionStatus
  signIn: (session: AuthSession) => void
  signOut: () => void
}

type AuthProviderProps = {
  children: ReactNode
  initialSession?: AuthSession | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({
  children,
  initialSession = null,
}: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(initialSession)

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      status: session ? "authenticated" : "anonymous",
      signIn: setSession,
      signOut: () => setSession(null),
    }),
    [session]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
