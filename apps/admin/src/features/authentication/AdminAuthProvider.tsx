import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AuthProvider, useAuth, type AuthSession } from "@workforce-erp/auth";
import { Loader2 } from "lucide-react";
import { StepUpVerificationDialog } from "./components/StepUpVerificationDialog";
import { apiClient, ADMIN_AUTH_UNAUTHORIZED_EVENT, registerAdminStepUpHandler } from "#lib/api";
import { toAdminSession } from "./admin-auth";
function UnauthorizedListener() {
  const { signOut } = useAuth();
  useEffect(() => {
    const h = () => signOut();
    window.addEventListener(ADMIN_AUTH_UNAUTHORIZED_EVENT, h);
    return () => window.removeEventListener(ADMIN_AUTH_UNAUTHORIZED_EVENT, h);
  }, [signOut]);
  return null;
}
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [initialSession, setInitialSession] = useState<AuthSession | null>(null);
  const [booting, setBooting] = useState(true);
  const [stepUpRequest, setStepUpRequest] = useState<{
    resolve: () => void;
    reject: (reason?: unknown) => void;
  } | null>(null);

  useEffect(
    () =>
      registerAdminStepUpHandler(
        () =>
          new Promise<void>((resolve, reject) => {
            setStepUpRequest({ resolve, reject });
          }),
      ),
    [],
  );

  const beginStepUp = useCallback(() => apiClient.beginStepUp(), []);
  const selectStepUpMethod = useCallback(
    (challengeId: string, method: "totp" | "email" | "sms") =>
      apiClient.selectChallengeMethod(challengeId, method),
    [],
  );
  const resendStepUp = useCallback(
    (challengeId: string) => apiClient.resendChallenge(challengeId),
    [],
  );
  const verifyStepUp = useCallback(
    (challengeId: string, code: string) => apiClient.verifyStepUp(challengeId, code),
    [],
  );
  useEffect(() => {
    let cancelled = false;
    void apiClient
      .platformContext()
      .then(({ data }) => {
        if (!cancelled) setInitialSession(toAdminSession(data));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setBooting(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  if (booting)
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Restoring admin session…
      </div>
    );
  return (
    <AuthProvider initialSession={initialSession} onSessionChange={setInitialSession}>
      <UnauthorizedListener />
      {children}
      <StepUpVerificationDialog
        open={stepUpRequest !== null}
        begin={beginStepUp}
        selectMethod={selectStepUpMethod}
        resend={resendStepUp}
        verify={verifyStepUp}
        onVerified={() => {
          const pending = stepUpRequest;
          setStepUpRequest(null);
          pending?.resolve();
        }}
        onCancel={() => {
          const pending = stepUpRequest;
          setStepUpRequest(null);
          pending?.reject(new Error("Identity verification was cancelled."));
        }}
      />
    </AuthProvider>
  );
}
