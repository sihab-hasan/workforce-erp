import { useEffect, useState, type FormEvent } from "react"
import { Loader2, Lock, LogOut, Mail, ShieldCheck } from "lucide-react"
import { Button } from "@workforce-erp/ui/components/button"
import { Input } from "@workforce-erp/ui/components/input"
import { Label } from "@workforce-erp/ui/components/label"

import {
  ADMIN_AUTH_UNAUTHORIZED_EVENT,
  apiClient,
  type AdminAuthResponse,
  type AdminAuthUser,
} from "./lib/api"

const ADMIN_ROLES = new Set(["owner", "admin"])
const portalBaseUrl = (
  import.meta.env.VITE_PORTAL_URL || "http://localhost:5174/portal"
).replace(/\/+$/, "")

type LoginMode = "password" | "otp"

export function App() {
  const [user, setUser] = useState<AdminAuthUser | null>(null)
  const [isBooting, setIsBooting] = useState(true)
  const [status, setStatus] = useState("Checking API…")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [otpRequested, setOtpRequested] = useState(false)
  const [mode, setMode] = useState<LoginMode>("password")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    void apiClient
      .getHealth()
      .then((payload) => setStatus(`${payload.status} · ${payload.service}`))
      .catch(() => setStatus("API unavailable"))
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null)
      setError("Your admin session expired or was revoked. Sign in again.")
    }
    window.addEventListener(ADMIN_AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
    return () =>
      window.removeEventListener(
        ADMIN_AUTH_UNAUTHORIZED_EVENT,
        handleUnauthorized
      )
  }, [])

  useEffect(() => {
    let cancelled = false
    void apiClient
      .me()
      .then(async (response) => {
        if (cancelled) return
        if (!response.user.role || !ADMIN_ROLES.has(response.user.role)) {
          await apiClient.logout().catch(() => undefined)
          setError("This account does not have admin application access.")
          setUser(null)
          return
        }
        setUser(response.user)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setIsBooting(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function acceptAuth(response: AdminAuthResponse) {
    if (!response.user.role || !ADMIN_ROLES.has(response.user.role)) {
      await apiClient.logout().catch(() => undefined)
      throw new Error("This account does not have admin application access.")
    }
    setUser(response.user)
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    if (!email.trim() || !password) {
      setError("Email and password are required.")
      return
    }

    setIsSubmitting(true)
    try {
      await acceptAuth(await apiClient.login(email.trim(), password))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function submitOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    if (!email.trim()) {
      setError("Email is required.")
      return
    }

    setIsSubmitting(true)
    try {
      if (!otpRequested) {
        const response = await apiClient.requestOtp(email.trim())
        setOtpRequested(true)
        setMessage(
          response.message ??
            "If eligible and email delivery is available, a one-time code will arrive shortly."
        )
      } else {
        if (!/^\d{6}$/.test(code)) {
          setError("Enter the 6-digit code.")
          return
        }
        await acceptAuth(await apiClient.verifyOtp(email.trim(), code))
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "One-time-code sign in failed."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function logout() {
    try {
      await apiClient.logout()
    } finally {
      setUser(null)
    }
  }

  if (isBooting) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2">
        <Loader2 className="animate-spin" /> Restoring admin session…
      </div>
    )
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center p-6">
        <section className="w-full space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="space-y-1 text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <h1 className="text-2xl font-semibold">Workforce ERP Admin</h1>
            <p className="text-sm text-muted-foreground">
              Owner/admin authentication required
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={mode === "password" ? "default" : "outline"}
              onClick={() => {
                setMode("password")
                setError(null)
                setMessage(null)
              }}
            >
              Password
            </Button>
            <Button
              variant={mode === "otp" ? "default" : "outline"}
              onClick={() => {
                setMode("otp")
                setError(null)
                setMessage(null)
              }}
            >
              One-time code
            </Button>
          </div>

          <form
            onSubmit={mode === "password" ? submitPassword : submitOtp}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="admin-email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setOtpRequested(false)
                    setCode("")
                  }}
                  className="pl-8"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {mode === "password" ? (
              <div className="space-y-1.5">
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="pl-8"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            ) : otpRequested ? (
              <div className="space-y-1.5">
                <Label htmlFor="admin-otp">6-digit code</Label>
                <Input
                  id="admin-otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  disabled={isSubmitting}
                />
              </div>
            ) : null}

            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Working…
                </>
              ) : mode === "password" ? (
                "Sign in"
              ) : otpRequested ? (
                "Verify code"
              ) : (
                "Send code"
              )}
            </Button>
          </form>

          <div className="flex justify-between text-xs">
            <a
              className="font-medium text-primary hover:underline"
              href={`${portalBaseUrl}/auth/forgot-password`}
            >
              Forgot password?
            </a>
            <a
              className="font-medium text-primary hover:underline"
              href={`${portalBaseUrl}/auth/login`}
            >
              Portal sign in
            </a>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            API status: {status}
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="m-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">Workforce ERP Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as {user.name} · {user.role}
          </p>
        </div>
        <Button variant="outline" onClick={() => void logout()}>
          <LogOut /> Log out
        </Button>
      </header>
      <section className="rounded-xl border border-border bg-card p-5">
        <p className="text-lg">API status: {status}</p>
      </section>
    </main>
  )
}
