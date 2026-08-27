import type { AuthSession } from "../types/auth.types";

let currentSession: AuthSession | null = null;

export function getSessionSnapshot() {
  return currentSession;
}

export function setSessionSnapshot(session: AuthSession | null) {
  currentSession = session;
}
