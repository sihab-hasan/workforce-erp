import { useState } from "react"
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"

import { Button } from "@workforce-erp/ui/components/button"
import { Input } from "@workforce-erp/ui/components/input"
import { Label } from "@workforce-erp/ui/components/label"
import { cn } from "@workforce-erp/ui/lib/utils"
import { AUTH_PATHS } from "@/modules/core/authentication/navigation.ts"

export interface LoginFormProps {
  className?: string
  onSuccess?: () => void
}

export function LoginForm({ className, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.")
      return
    }

    // Placeholder: simulate async login
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      // TODO: replace with real auth call
      onSuccess?.()
    }, 1200)
  }

  return (
    <form
      id="login-form"
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-5", className)}
      noValidate
    >
      {/* Email field */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-email">Email address</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-8"
            aria-required="true"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Password field */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <a
            href={`#${AUTH_PATHS.forgotPassword}`}
            id="forgot-password-link"
            className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-8"
            aria-required="true"
            disabled={isLoading}
          />
          <button
            type="button"
            id="toggle-password-visibility"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            tabIndex={-1}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      {/* Inline error */}
      {error && (
        <p
          id="login-error"
          role="alert"
          className="-mt-1 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        id="login-submit-button"
        size="lg"
        className="mt-1 w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  )
}
