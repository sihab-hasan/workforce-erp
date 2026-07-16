import type { ReactNode } from "react"

type FeatureFlagProviderProps = {
  children: ReactNode
}

export function FeatureFlagProvider({ children }: FeatureFlagProviderProps) {
  return children
}
