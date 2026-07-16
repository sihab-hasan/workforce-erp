import { useSession } from "./use-session"

export function useAuth() {
  const session = useSession()

  return {
    ...session,
    isAuthenticated: session.status === "authenticated",
  }
}
