import type { ReactNode } from "react"
import { AuthProvider } from "@/app/providers/AuthProvider.tsx"
import { FeatureFlagProvider } from "@/app/providers/FeatureFlagProvider.tsx"
import { I18nProvider } from "@/app/providers/I18nProvider.tsx"
import { QueryProvider } from "@/app/providers/QueryProvider.tsx"

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <FeatureFlagProvider>
      <I18nProvider>
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </I18nProvider>
    </FeatureFlagProvider>
  )
}
