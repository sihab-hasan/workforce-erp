import { useState } from "react"
import { Loader2, MailCheck } from "lucide-react"

import { Button } from "@workforce-erp/ui/components/button"
import {
  AUTH_PATHS,
  navigateTo,
} from "@/modules/core/authentication/navigation.ts"
import { AuthCard } from "@/modules/core/authentication/components/AuthCard.tsx"

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false)
  const [resent, setResent] = useState(false)

  function handleResend() {
    setIsResending(true)
    // Placeholder: simulate resend
    setTimeout(() => {
      setIsResending(false)
      setResent(true)
    }, 1000)
  }

  return (
    <AuthCard
      icon={<MailCheck className="size-6" />}
      heading="Check your email"
      subheading="We sent a verification link to your inbox"
      footer={
        <a
          href={`#${AUTH_PATHS.login}`}
          id="verify-back-to-login-link"
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          ← Back to sign in
        </a>
      }
    >
      <div
        id="verify-email-content"
        className="flex flex-col items-center gap-5 py-2 text-center"
      >
        <p className="text-muted-foreground text-sm leading-relaxed">
          Click the link in the email to activate your account. The link will
          expire in&nbsp;
          <span className="text-foreground font-medium">24 hours</span>.
        </p>

        <Button
          id="verify-email-continue-button"
          size="lg"
          className="w-full"
          onClick={() => navigateTo(AUTH_PATHS.login)}
        >
          Open sign in
        </Button>

        <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <span>Didn&apos;t receive it?</span>
          {resent ? (
            <span className="text-primary font-medium">Sent ✓</span>
          ) : (
            <button
              id="verify-email-resend-button"
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-primary font-medium underline-offset-4 hover:underline disabled:opacity-50"
            >
              {isResending ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="size-3 animate-spin" />
                  Resending…
                </span>
              ) : (
                "Resend email"
              )}
            </button>
          )}
        </div>
      </div>
    </AuthCard>
  )
}
