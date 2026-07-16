import type { ReactNode } from "react"
import { Can } from "./Can"

type RequirePermissionProps = {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}

export function RequirePermission(props: RequirePermissionProps) {
  return <Can {...props} />
}
