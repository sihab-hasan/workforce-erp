import { useState } from "react"
import { Loader2, Mail } from "lucide-react"

import { Button } from "@workforce-erp/ui/components/button"
import { Input } from "@workforce-erp/ui/components/input"
import { Label } from "@workforce-erp/ui/components/label"
import { cn } from "@workforce-erp/ui/lib/utils"
import { AUTH_PATHS } from "@/modules/core/authentication/navigation.ts"

export interface ForgotPasswordFormProps {
  className?: string
  onSuccess?: () => void
}

export function ForgotPasswordForm({ className, onSuccess }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }

    // Placeholder: simulate sending reset email
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setSent(true)
      onSuccess?.()
    }, 1200)
  }

  if (sent) {
    return (
      <div
        id="forgot-password-success"
        className={cn(
          "flex flex-col items-center gap-4 py-2 text-center",
          className
        )}
      >
        <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
          <Mail className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-foreground text-sm font-medium">Check your inbox</p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            If <span className="text-foreground font-medium">{email}</span> is
            registered, you&apos;ll receive a reset link shortly.
          </p>
        </div>

        {/* Demo: simulate clicking the link that arrives in the email */}
        <Button
          id="forgot-password-go-to-reset"
          size="lg"
          className="w-full"
          onClick={() => { window.location.hash = AUTH_PATHS.resetPassword }}
        >
          Set new password →
        </Button>

        <button
          id="forgot-password-try-again"
          type="button"
          onClick={() => setSent(false)}
          className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
        >
          Try a different email
        </button>
      </div>
    )
  }

  return (
    <form
      id="forgot-password-form"
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-5", className)}
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="forgot-email">Email address</Label>
        <div className="relative">
          <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            id="forgot-email"
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

      {error && (
        <p id="forgot-password-error" role="alert" className="text-destructive -mt-1 text-sm">
          {error}
        </p>
      )}

      <Button
        type="submit"
        id="forgot-password-submit"
        size="lg"
        className="mt-1 w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Sending link…
          </>
        ) : (
          "Send reset link"
        )}
      </Button>
    </form>
  )
}
