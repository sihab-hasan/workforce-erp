import { useEffect, useRef } from "react";
import { Loader2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@workforce-erp/auth";
import { authenticationApi } from "#features/authentication/api/authentication.api";
import { AUTH_PATHS } from "#features/authentication/navigation";

export function SignOutFeature() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    void authenticationApi
      .logout()
      .catch(() => undefined)
      .finally(() => {
        signOut();
        navigate(AUTH_PATHS.login, { replace: true });
      });
  }, [navigate, signOut]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LogOut className="size-5" />
        </span>
        <div>
          <p className="font-medium">Signing you out</p>
          <p className="mt-1 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Closing your secure session…
          </p>
        </div>
      </div>
    </main>
  );
}
