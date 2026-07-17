import { AppProviders } from "@/app/providers/AppProviders"
import { WebRouter } from "@/app/router/router.tsx"

export function App() {
  return (
    <AppProviders>
      <WebRouter />
    </AppProviders>
  )
}
