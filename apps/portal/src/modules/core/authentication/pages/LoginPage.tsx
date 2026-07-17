import { AUTH_PATHS, navigateTo } from "@/modules/core/authentication/navigation.ts"
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
            className="text-primary font-medium underline-offset-4 hover:underline"
          >
            Create one
          </a>
        </>
      }
    >
      <LoginForm onSuccess={() => navigateTo(AUTH_PATHS.mfaChallenge)} />

      {/* Divider */}
      <div className="relative my-2 flex items-center gap-3">
        <div className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs">or</span>
        <div className="bg-border h-px flex-1" />
      </div>

      <SocialLoginButtons action="Sign in" />

      <p className="text-muted-foreground mt-4 text-center text-xs">
        Having trouble?{" "}
        <a
          href="mailto:support@workforce.example"
          id="contact-support-link"
          className="hover:text-primary underline-offset-4 transition-colors hover:underline"
        >
          Contact support
        </a>
      </p>
    </AuthCard>
  )
}
