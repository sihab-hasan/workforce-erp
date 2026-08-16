import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@workforce-erp/auth-client"

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (isAuthenticated) return <>{children}</>

  const returnTo = `${location.pathname}${location.search}${location.hash}`
  return (
    <Navigate
      to={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
      replace
    />
  )
}
