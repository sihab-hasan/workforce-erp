import { ShieldCheck } from "lucide-react"

import {
  AUTH_PATHS,
  navigateTo,
} from "@/modules/core/authentication/navigation.ts"
import { AuthCard } from "@/modules/core/authentication/components/AuthCard.tsx"
import { PasswordResetForm } from "@/modules/core/authentication/components/PasswordResetForm.tsx"

export default function ResetPasswordPage() {
  return (
    <AuthCard
      icon={<ShieldCheck className="size-6" />}
      heading="Set a new password"
      subheading="Choose a strong password for your account"
      footer={
        <a
          href={`#${AUTH_PATHS.login}`}
          id="reset-back-to-login-link"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          ← Back to sign in
        </a>
      }
    >
      <PasswordResetForm onSuccess={() => navigateTo(AUTH_PATHS.login)} />
    </AuthCard>
  )
}
