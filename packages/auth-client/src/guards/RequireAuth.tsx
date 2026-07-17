import type { ReactNode } from "react"
import { useAuth } from "../hooks/use-auth"

type RequireAuthProps = {
  children: ReactNode
  fallback?: ReactNode
}

export function RequireAuth({ children, fallback = null }: RequireAuthProps) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return fallback
  }

  return children
}
