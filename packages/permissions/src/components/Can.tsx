import type { ReactNode } from "react"
import { usePermission } from "../hooks/use-permission"

type CanProps = {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const { can } = usePermission()

  if (!can(permission)) {
    return fallback
  }

  return children
}
