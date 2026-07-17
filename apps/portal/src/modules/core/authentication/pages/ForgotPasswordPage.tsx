import { KeyRound } from "lucide-react"

import { AUTH_PATHS } from "@/modules/core/authentication/navigation.ts"
import { AuthCard } from "@/modules/core/authentication/components/AuthCard.tsx"
import { ForgotPasswordForm } from "@/modules/core/authentication/components/ForgotPasswordForm.tsx"

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      icon={<KeyRound className="size-6" />}
      heading="Forgot your password?"
      subheading="Enter your email and we'll send you a reset link"
      footer={
        <a
          href={`#${AUTH_PATHS.login}`}
          id="back-to-login-link"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          ← Back to sign in
        </a>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  )
}
