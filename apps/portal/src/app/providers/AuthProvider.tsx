import { useCallback, useEffect, useState, type ReactNode } from "react"
import { AlertCircle, Loader2, RefreshCw } from "lucide-react"
import {
  AuthProvider as SharedAuthProvider,
  useAuth,
  type AuthSession,
} from "@workforce-erp/auth-client"
import { ApiError } from "@workforce-erp/api-client"
import { Button } from "@workforce-erp/ui/components/button"
import { apiClient, AUTH_UNAUTHORIZED_EVENT } from "@/lib/api"

function UnauthorizedSessionListener() {
  const { signOut } = useAuth()
  useEffect(() => {
    const handleUnauthorized = () => signOut()
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
    return () =>
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [signOut])
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [bootstrapError, setBootstrapError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const retry = useCallback(() => {
    setBootstrapError(null)
    setIsLoading(true)
    setReloadKey((value) => value + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadSession() {
      try {
        const response = await apiClient.get<{
          success: boolean
          user: {
            id: string
            name: string
            email: string
            role?: string | null
            organization_id?: string | null
            organization_name?: string | null
          }
        }>("/api/v1/auth/me")
        if (cancelled) return
        setSession({
          user: {
            id: String(response.user.id),
            name: response.user.name,
            email: response.user.email,
            role: response.user.role,
            organizationId: response.user.organization_id,
            organizationName: response.user.organization_name,
          },
        })
        setBootstrapError(null)
      } catch (error) {
        if (cancelled) return
        if (error instanceof ApiError && error.status === 401) setSession(null)
        else
          setBootstrapError(
            error instanceof Error
              ? error.message
              : "Unable to connect to the authentication service."
          )
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void loadSession()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  if (isLoading)
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

  if (bootstrapError)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <AlertCircle className="size-9 text-destructive" />
          <div>
            <h1 className="text-lg font-semibold">
              Authentication service unavailable
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {bootstrapError}
            </p>
          </div>
          <Button type="button" onClick={retry}>
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </div>
      </div>
    )

  return (
    <SharedAuthProvider initialSession={session}>
      <UnauthorizedSessionListener />
      {children}
    </SharedAuthProvider>
  )
}
