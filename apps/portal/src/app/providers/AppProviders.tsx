import type { ReactNode } from "react"
import { ThemeProvider } from "@workforce-erp/ui/providers/theme-provider"
import { Toaster } from "@workforce-erp/ui/components/sonner"
import { AuthProvider } from "@/app/providers/AuthProvider.tsx"
import { FeatureFlagProvider } from "@/app/providers/FeatureFlagProvider.tsx"
import { I18nProvider } from "@/app/providers/I18nProvider.tsx"
import { QueryProvider } from "@/app/providers/QueryProvider.tsx"

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <FeatureFlagProvider>
        <I18nProvider>
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </AuthProvider>
        </I18nProvider>
      </FeatureFlagProvider>
    </ThemeProvider>
  )
}
