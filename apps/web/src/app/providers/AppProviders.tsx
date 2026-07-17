import type { ReactNode } from "react"

import { ThemeProvider } from "@/app/providers/ThemeProvider"

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="workforce-web-theme">
      {children}
    </ThemeProvider>
  )
}
