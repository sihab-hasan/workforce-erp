import type { ReactNode } from "react"

type PortalLayoutProps = {
  children: ReactNode
}

export function PortalLayout({ children }: PortalLayoutProps) {
  return <main className="p-6">{children}</main>
}
