import { useState } from "react"
import { Eye, EyeOff, Loader2, Lock } from "lucide-react"

import { Button } from "@workforce-erp/ui/components/button"
import { Input } from "@workforce-erp/ui/components/input"
import { Label } from "@workforce-erp/ui/components/label"
import { cn } from "@workforce-erp/ui/lib/utils"

export interface PasswordResetFormProps {
  className?: string
  onSuccess?: () => void
}

export function PasswordResetForm({ className, onSuccess }: PasswordResetFormProps) {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!password.trim() || !confirm.trim()) {
      setError("Please fill in both fields.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    // Placeholder: simulate async password reset
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onSuccess?.()
    }, 1200)
  }

  /** Strength indicator: 0–4 */
  function strengthScore(pw: string): number {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }

  const score = strengthScore(password)
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][score] ?? ""
  const strengthColor = [
    "",
    "bg-destructive",
    "bg-amber-500",
    "bg-yellow-400",
    "bg-primary",
  ][score]

  return (
    <form
      id="reset-password-form"
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-5", className)}
      noValidate
    >
      {/* New password */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reset-password">New password</Label>
        <div className="relative">
          <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            id="reset-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-8"
            aria-required="true"
            disabled={isLoading}
          />
          <button
            type="button"
            id="reset-toggle-password"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 transition-colors"
            tabIndex={-1}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        {/* Strength bar */}
        {password.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="bg-border flex h-1 flex-1 gap-0.5 overflow-hidden rounded-full">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={cn(
                    "h-full flex-1 rounded-full transition-all",
                    step <= score ? strengthColor : "bg-border"
                  )}
                />
              ))}
            </div>
            <span className="text-muted-foreground w-10 text-right text-xs">
              {strengthLabel}
            </span>
          </div>
        )}
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reset-password-confirm">Confirm password</Label>
        <div className="relative">
          <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            id="reset-password-confirm"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="px-8"
            aria-required="true"
            disabled={isLoading}
            aria-invalid={confirm.length > 0 && confirm !== password ? true : undefined}
          />
          <button
            type="button"
            id="reset-toggle-confirm"
            aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
            onClick={() => setShowConfirm((v) => !v)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 transition-colors"
            tabIndex={-1}
            disabled={isLoading}
          >
            {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p id="reset-password-error" role="alert" className="text-destructive -mt-1 text-sm">
          {error}
        </p>
      )}

      <Button
        type="submit"
        id="reset-password-submit"
        size="lg"
        className="mt-1 w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Resetting…
          </>
        ) : (
          "Set new password"
        )}
      </Button>
    </form>
  )
}
