import { useEffect, useState, type ReactNode } from "react"
import { Loader2 } from "lucide-react"

import {
  AuthProvider as SharedAuthProvider,
  getStoredToken,
  clearStoredToken,
  type AuthSession,
} from "@workforce-erp/auth-client"
import { apiClient } from "@/lib/api"

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(() => {
    return typeof window !== "undefined" && !!getStoredToken()
  })

  useEffect(() => {
    const token = getStoredToken()

    if (!token) {
      return
    }

    async function loadSession() {
      try {
        const response = await apiClient.get<{
          success: boolean
          user: { id: string; name: string; email: string }
        }>("/api/v1/auth/me")

        if (response.success && response.user) {
          setSession({
            accessToken: token!,
            user: {
              id: String(response.user.id),
              name: response.user.name,
              email: response.user.email,
            },
          })
        } else {
          clearStoredToken()
        }
      } catch (err) {
        console.error("Failed to load user session:", err)
        clearStoredToken()
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            Loading your session...
          </span>
        </div>
      </div>
    )
  }

  return (
    <SharedAuthProvider initialSession={session}>{children}</SharedAuthProvider>
  )
}
