import { useState } from "react"
import { Loader2, ShieldCheck } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { AUTH_PATHS } from "@/modules/core/authentication/navigation.ts"
import { AuthCard } from "@/modules/core/authentication/components/AuthCard.tsx"
import { MfaChallengeForm } from "@/modules/core/authentication/components/MfaChallengeForm.tsx"

export default function MfaChallengePage() {
  const navigate = useNavigate()
  const [isResending, setIsResending] = useState(false)
  const [resent, setResent] = useState(false)

  function handleResend() {
    setIsResending(true)
    setTimeout(() => {
      setIsResending(false)
      setResent(true)
    }, 1000)
  }

  return (
    <AuthCard
      icon={<ShieldCheck className="size-6" />}
      heading="Two-factor authentication"
      subheading="Enter the 6-digit code from your authenticator app"
      footer={
        <Link
          to={AUTH_PATHS.login}
          id="mfa-back-to-login-link"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          ← Back to sign in
        </Link>
      }
    >
      <MfaChallengeForm onSuccess={() => navigate("/")} />

      <div className="mt-4 text-center text-sm text-muted-foreground">
        Didn&apos;t receive a code?{" "}
        {resent ? (
          <span className="font-medium text-primary">Sent ✓</span>
        ) : (
          <button
            id="mfa-resend-code-button"
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="font-medium text-primary underline-offset-4 hover:underline disabled:opacity-50"
          >
            {isResending ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="size-3 animate-spin" />
                Resending…
              </span>
            ) : (
              "Resend code"
            )}
          </button>
        )}
      </div>
    </AuthCard>
  )
}
