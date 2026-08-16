import { useEffect, useRef, useState } from "react"
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useAuth } from "@workforce-erp/auth-client"

import {
  AUTH_PATHS,
  safeReturnTo,
} from "@/modules/core/authentication/navigation"
import { AuthCard } from "@/modules/core/authentication/components/AuthCard"
import {
  authenticationApi,
  toAuthSession,
  type SsoProvider,
} from "@/modules/core/authentication/api/authentication.api"

function isProvider(value: string | undefined): value is SsoProvider {
  return value === "google" || value === "microsoft"
}

export default function SsoCallbackPage() {
  const { provider } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const finishWithError = (message: string) => {
      // Defer UI state to a task callback so the effect itself only coordinates
      // browser/session state and the asynchronous SSO operation.
      queueMicrotask(() => setError(message))
    }

    if (!isProvider(provider)) {
      finishWithError("Unsupported single sign-on provider.")
      return
    }

    const stateKey = `workforce-erp.sso.${provider}.state`
    const returnToKey = `workforce-erp.sso.${provider}.returnTo`
    const cleanup = () => {
      sessionStorage.removeItem(stateKey)
      sessionStorage.removeItem(returnToKey)
    }

    const oauthError = searchParams.get("error")
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const expectedState = sessionStorage.getItem(stateKey)
    const returnTo = safeReturnTo(sessionStorage.getItem(returnToKey))

    if (oauthError) {
      cleanup()
      finishWithError(`Single sign-on was cancelled or denied: ${oauthError}`)
      return
    }

    if (!code || !state || !expectedState || state !== expectedState) {
      cleanup()
      finishWithError(
        "The single sign-on response is incomplete or its security state does not match."
      )
      return
    }

    void authenticationApi
      .completeSso(provider, code, state)
      .then((response) => {
        cleanup()
        signIn(toAuthSession(response))
        navigate(returnTo, { replace: true })
      })
      .catch((err: unknown) => {
        cleanup()
        setError(
          err instanceof Error
            ? err.message
            : "Single sign-on could not be completed."
        )
      })
  }, [navigate, provider, searchParams, signIn])

  return (
    <AuthCard
      icon={
        error ? (
          <AlertTriangle className="size-6" />
        ) : (
          <ShieldCheck className="size-6" />
        )
      }
      heading={error ? "We couldn’t sign you in" : "Completing secure sign-in"}
      subheading={
        error
          ? "Your single sign-on session could not be completed. Review the message below and try again."
          : "We’re securely confirming your identity and connecting you to Workforce ERP."
      }
      footer={
        error ? (
          <Link
            to={AUTH_PATHS.login}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            ← Back to sign in
          </Link>
        ) : undefined
      }
    >
      {error ? (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p role="alert" className="text-sm leading-6 text-destructive">
            {error}
          </p>
        </div>
      ) : (
        <div
          role="status"
          className="flex flex-col items-center justify-center gap-3 py-5 text-center"
        >
          <Loader2 className="size-6 animate-spin text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Signing you in…
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Please keep this page open while we finish the connection.
            </p>
          </div>
        </div>
      )}
    </AuthCard>
  )
}
