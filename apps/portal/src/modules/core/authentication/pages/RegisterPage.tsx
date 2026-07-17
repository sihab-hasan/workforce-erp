import { UserPlus } from "lucide-react"

import {
  AUTH_PATHS,
  navigateTo,
} from "@/modules/core/authentication/navigation.ts"
import { AuthCard } from "@/modules/core/authentication/components/AuthCard.tsx"
import { RegisterForm } from "@/modules/core/authentication/components/RegisterForm.tsx"
import { SocialLoginButtons } from "@/modules/core/authentication/components/SocialLoginButtons.tsx"

export default function RegisterPage() {
  return (
    <AuthCard
      icon={<UserPlus className="size-6" />}
      heading="Create your account"
      subheading="Join your team on Workforce ERP"
      footer={
        <>
          Already have an account?{" "}
          <a
            href={`#${AUTH_PATHS.login}`}
            id="go-to-login-link"
            className="text-primary font-medium underline-offset-4 hover:underline"
          >
            Sign in
          </a>
        </>
      }
    >
      <RegisterForm onSuccess={() => navigateTo(AUTH_PATHS.verifyEmail)} />

      {/* Divider */}
      <div className="relative my-2 flex items-center gap-3">
        <div className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs">or</span>
        <div className="bg-border h-px flex-1" />
      </div>

      <SocialLoginButtons action="Sign up" />
    </AuthCard>
  )
}
