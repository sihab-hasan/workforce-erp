import {
  AUTH_PATHS,
  navigateTo,
} from "@/modules/core/authentication/navigation.ts"
import { AuthCard } from "@/modules/core/authentication/components/AuthCard.tsx"
import { LoginForm } from "@/modules/core/authentication/components/LoginForm.tsx"
import { SocialLoginButtons } from "@/modules/core/authentication/components/SocialLoginButtons.tsx"

export default function LoginPage() {
  return (
    <AuthCard
      heading="Sign in to Workforce"
      subheading="Enter your credentials to access the portal"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <a
            href={`#${AUTH_PATHS.register}`}
            id="go-to-register-link"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create one
          </a>
        </>
      }
    >
      <LoginForm onSuccess={() => navigateTo(AUTH_PATHS.mfaChallenge)} />

      {/* Divider */}
      <div className="relative my-2 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <SocialLoginButtons action="Sign in" />

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Having trouble?{" "}
        <a
          href="mailto:support@workforce.example"
          id="contact-support-link"
          className="underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          Contact support
        </a>
      </p>
    </AuthCard>
  )
}
