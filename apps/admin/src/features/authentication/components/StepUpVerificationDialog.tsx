import { useEffect, useMemo, useState } from "react";
import { Button } from "@workforce-erp/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workforce-erp/ui/components/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@workforce-erp/ui/components/input-otp";
import { Label } from "@workforce-erp/ui/components/label";

export type StepUpVerificationMethod = "totp" | "email" | "sms";

export interface StepUpVerificationChallenge {
  id: string;
  purpose: string;
  available_methods: StepUpVerificationMethod[];
  selected_method: StepUpVerificationMethod | null;
  expires_at?: string | null;
  resend_available_at?: string | null;
}

export interface StepUpVerificationDialogProps {
  open: boolean;
  begin: () => Promise<{ challenge: StepUpVerificationChallenge }>;
  selectMethod: (
    challengeId: string,
    method: StepUpVerificationMethod,
  ) => Promise<{ challenge: StepUpVerificationChallenge }>;
  resend: (challengeId: string) => Promise<{ challenge: StepUpVerificationChallenge }>;
  verify: (challengeId: string, code: string) => Promise<unknown>;
  onVerified: () => void;
  onCancel: () => void;
}

const labels: Record<StepUpVerificationMethod, string> = {
  totp: "Authenticator App",
  email: "Email Verification Code",
  sms: "Phone / SMS Verification Code",
};

export function StepUpVerificationDialog({
  open,
  begin,
  selectMethod,
  resend,
  verify,
  onVerified,
  onCancel,
}: StepUpVerificationDialogProps) {
  const [challenge, setChallenge] = useState<StepUpVerificationChallenge | null>(null);
  const [selected, setSelected] = useState<StepUpVerificationMethod | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useMemo(() => challenge?.available_methods ?? [], [challenge]);

  useEffect(() => {
    if (!open) {
      setChallenge(null);
      setSelected(null);
      setCode("");
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    void begin()
      .then(({ challenge: next }) => {
        if (!cancelled) setChallenge(next);
      })
      .catch((reason: unknown) => {
        if (!cancelled)
          setError(
            reason instanceof Error ? reason.message : "Identity verification could not start.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [begin, open]);

  async function choose(method: StepUpVerificationMethod) {
    if (!challenge || loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await selectMethod(challenge.id, method);
      setChallenge(response.challenge);
      setSelected(method);
      setCode("");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Verification method could not be selected.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge || !selected || loading) return;
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await verify(challenge.id, code);
      onVerified();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Identity verification failed.");
      setCode("");
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    if (!challenge || !selected || selected === "totp" || loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await resend(challenge.id);
      setChallenge(response.challenge);
      setCode("");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "A new verification code cannot be sent yet.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <DialogContent showCloseButton={!loading}>
        <DialogHeader>
          <DialogTitle>Verify your identity</DialogTitle>
          <DialogDescription>
            This sensitive action requires recent Two-Step Verification. The original action will be
            retried once after verification succeeds.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit} noValidate>
          {!challenge && loading ? (
            <p className="text-sm text-muted-foreground">Preparing verification…</p>
          ) : null}

          {challenge && !selected ? (
            <div className="space-y-2">
              <Label>Verification method</Label>
              <div className="grid gap-2">
                {methods.map((method) => (
                  <Button
                    key={method}
                    type="button"
                    variant="outline"
                    className="justify-start"
                    disabled={loading}
                    onClick={() => void choose(method)}
                  >
                    {labels[method]}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}

          {challenge && selected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>{labels[selected]}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={loading}
                  onClick={() => {
                    setSelected(null);
                    setCode("");
                    setError(null);
                  }}
                >
                  Change
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="step-up-code">Verification code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    id="step-up-code"
                    maxLength={6}
                    value={code}
                    disabled={loading}
                    autoFocus
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    onChange={(val) => {
                      setCode(val.replace(/\D/g, "").slice(0, 6));
                      setError(null);
                    }}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
            </div>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          {challenge && selected ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              {selected !== "totp" ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={loading}
                  onClick={() => void resendCode()}
                >
                  Resend code
                </Button>
              ) : null}
              <Button type="submit" disabled={loading || code.length !== 6}>
                Verify & continue
              </Button>
            </div>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
