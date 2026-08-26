import { createContext } from "react";
import type { AuthSession, SessionStatus } from "../types/auth.types";

export interface AuthContextValue {
  session: AuthSession | null;
  status: SessionStatus;
  isAuthenticated: boolean;
  signIn(session: AuthSession): void;
  signOut(): void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
