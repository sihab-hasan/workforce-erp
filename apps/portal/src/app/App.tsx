import { AppProviders } from "@/app/providers/AppProviders.tsx"
import { PortalRouter } from "@/app/router/router.tsx"

export function App() {
  return (
    <AppProviders>
      <PortalRouter />
    </AppProviders>
  )
}
