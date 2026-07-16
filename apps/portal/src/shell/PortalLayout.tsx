import type { PortalRoute } from "@/app/config/routes.config.ts"

type PortalLayoutProps = {
  route: PortalRoute
}

export function PortalLayout({ route }: PortalLayoutProps) {
  return (
    <main className="p-6">
      <h1>{route.title}</h1>
    </main>
  )
}
