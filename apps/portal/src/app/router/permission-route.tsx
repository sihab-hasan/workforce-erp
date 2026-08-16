import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@workforce-erp/auth-client"

export function PermissionRoute({
  allowedRoles,
  children,
}: {
  allowedRoles?: string[]
  children: ReactNode
}) {
  const { session } = useAuth()

  if (!allowedRoles || allowedRoles.length === 0) return <>{children}</>
  if (session?.user.role && allowedRoles.includes(session.user.role)) {
    return <>{children}</>
  }

  return <Navigate to="/system/forbidden" replace />
}
