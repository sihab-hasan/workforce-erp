import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AUTH_PATHS } from "#features/authentication/navigation";
import { useAuth } from "@workforce-erp/auth";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { cn } from "@workforce-erp/ui/lib/utils";
import { profileSecurityApi } from "#features/authentication/profile/api/profile.api";

export interface PasswordChangeFormProps {
  className?: string;
}

export function PasswordChangeForm({ className }: PasswordChangeFormProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!currentPassword || !password || !confirmation) {
      setError("Complete all password fields.");
      return;
    }
    if (password !== confirmation) {
      setError("New passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await profileSecurityApi.changePassword({
        current_password: currentPassword,
        password,
        password_confirmation: confirmation,
      });
      signOut();
      navigate(`${AUTH_PATHS.login}?passwordChanged=success`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password change failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-5", className)} noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="current-password">Current password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="current-password"
            type={showCurrent ? "text" : "password"}
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="px-8"
            disabled={isLoading}
          />
          <button
            type="button"
            aria-label={showCurrent ? "Hide current password" : "Show current password"}
            onClick={() => setShowCurrent((value) => !value)}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
          >
            {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new-password">New password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="new-password"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            placeholder="10+ chars, upper/lower, number, symbol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-8"
            disabled={isLoading}
          />
          <button
            type="button"
            aria-label={showNew ? "Hide new password" : "Show new password"}
            onClick={() => setShowNew((value) => !value)}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
          >
            {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm-new-password">Confirm new password</Label>
        <Input
          id="confirm-new-password"
          type="password"
          autoComplete="new-password"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Changing password…
          </>
        ) : (
          "Change password"
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        Changing your password signs out every active API session, including this one.
      </p>
    </form>
  );
}
