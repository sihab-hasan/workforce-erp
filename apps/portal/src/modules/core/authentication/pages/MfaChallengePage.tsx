import { ShieldCheck } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import {
  AUTH_PATHS,
  safeReturnTo,
} from "@/modules/core/authentication/navigation.ts"
import { AuthCard } from "@/modules/core/authentication/components/AuthCard.tsx"
import { MfaChallengeForm } from "@/modules/core/authentication/components/MfaChallengeForm.tsx"

export default function MfaChallengePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialEmail = searchParams.get("email")?.trim() ?? ""
  const returnTo = safeReturnTo(searchParams.get("returnTo"))
  const loginQuery =
    returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""

  return (
    <AuthCard
      icon={<ShieldCheck className="size-6" />}
      heading="Sign in with a one-time code"
      subheading="Enter your account email to receive a 6-digit verification code for secure, passwordless access."
      footer={
        <Link
          to={`${AUTH_PATHS.login}${loginQuery}`}
          id="mfa-back-to-login-link"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          ← Use password instead
        </Link>
      }
    >
      <MfaChallengeForm
        initialEmail={initialEmail}
        onSuccess={() => navigate(returnTo, { replace: true })}
      />
    </AuthCard>
  )
}
