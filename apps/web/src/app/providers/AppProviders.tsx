import type { ReactNode } from "react"

import { ThemeProvider } from "@workforce-erp/ui/providers/theme-provider"

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return <ThemeProvider>{children}</ThemeProvider>
}
