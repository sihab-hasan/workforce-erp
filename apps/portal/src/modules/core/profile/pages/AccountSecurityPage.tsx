import { useAuth } from "@workforce-erp/auth-client"
import { PasswordChangeForm } from "@/modules/core/profile/components/PasswordChangeForm"

export default function AccountSecurityPage() {
  const { session } = useAuth()

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Account Security</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the password for {session?.user.email}.
        </p>
      </header>

      <section className="max-w-xl rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Change password</h2>
        <PasswordChangeForm />
      </section>
    </main>
  )
}
