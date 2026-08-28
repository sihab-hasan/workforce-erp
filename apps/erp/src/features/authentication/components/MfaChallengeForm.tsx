import { useEffect, useMemo, useState } from "react";
import { Loader2, Mail, MessageSquareText, ShieldCheck } from "lucide-react";
import { useAuth } from "@workforce-erp/auth";
import { Button } from "@workforce-erp/ui/components/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@workforce-erp/ui/components/input-otp";
import { Label } from "@workforce-erp/ui/components/label";
import { cn } from "@workforce-erp/ui/lib/utils";
import {
  authenticationApi,
  toAuthSession,
  type VerificationChallengePayload,
  type VerificationMethod,
} from "#features/authentication/api/authentication.api";

const METHOD_LABELS: Record<VerificationMethod, string> = {
  totp: "Authenticator App",
  email: "Email Code",
  sms: "SMS Code",
};
const METHOD_ICONS = {
  totp: ShieldCheck,
  email: Mail,
  sms: MessageSquareText,
} satisfies Record<VerificationMethod, typeof ShieldCheck>;

export interface MfaChallengeFormProps {
  className?: string;
  challengeId: string;
  initialMethods?: VerificationMethod[];
  onSuccess?: () => void;
}

export function MfaChallengeForm({
  className,
  challengeId,
  initialMethods = [],
  onSuccess,
}: MfaChallengeFormProps) {
  const [challenge, setChallenge] = useState<VerificationChallengePayload | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<VerificationMethod | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const availableMethods = useMemo(
    () => challenge?.available_methods ?? initialMethods,
    [challenge, initialMethods],
  );

  useEffect(() => {
    setSelectedMethod(null);
    setCode("");
    setError(null);
  }, [challengeId]);

  async function chooseMethod(method: VerificationMethod) {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await authenticationApi.selectChallengeMethod(challengeId, method);
      setChallenge(response.challenge);
      setSelectedMethod(method);
      setCode("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Verification method could not be selected.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !selectedMethod) return;
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await authenticationApi.verifyLoginChallenge(challengeId, code);
      signIn(toAuthSession(response));
      onSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Verification could not be completed.");
      setCode("");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (loading || !selectedMethod || selectedMethod === "totp") return;
    setLoading(true);
    setError(null);
    try {
      const response = await authenticationApi.resendChallenge(challengeId);
      setChallenge(response.challenge);
      setCode("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "A new code could not be sent yet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={verify} className={cn("flex flex-col gap-5", className)} noValidate>
      {!selectedMethod ? (
        <div className="space-y-3">
          <Label>Choose verification method</Label>
          <div className="grid gap-2">
            {availableMethods.map((method) => {
              const Icon = METHOD_ICONS[method];
              return (
                <Button
                  key={method}
                  type="button"
                  variant="outline"
                  className="h-auto justify-start gap-3 px-4 py-3"
                  disabled={loading}
                  onClick={() => void chooseMethod(method)}
                >
                  <Icon className="size-4" />
                  <span className="text-left">
                    <span className="block font-medium">{METHOD_LABELS[method]}</span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {method === "totp"
                        ? "Use the current code from your authenticator app."
                        : method === "email"
                          ? "Receive a single-use code at your verified work email."
                          : "Receive a single-use code at your verified phone number."}
                    </span>
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2.5 text-sm">
            <span className="font-medium">{METHOD_LABELS[selectedMethod]}</span>
            <button
              type="button"
              onClick={() => {
                setSelectedMethod(null);
                setCode("");
                setError(null);
              }}
              className="float-right text-xs font-medium text-primary underline-offset-4 hover:underline"
              disabled={loading}
            >
              Change
            </button>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Label htmlFor="verification-code">Verification code</Label>
            <InputOTP
              id="verification-code"
              maxLength={6}
              value={code}
              onChange={(val) => {
                setCode(val);
                setError(null);
              }}
              disabled={loading}
              autoFocus
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
        </>
      )}

      {error ? (
        <p role="alert" className="rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {selectedMethod ? (
        <>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || code.length !== 6}
          >
            {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck className="size-4" />}
            Verify and sign in
          </Button>
          {selectedMethod !== "totp" ? (
            <Button type="button" variant="ghost" disabled={loading} onClick={() => void resend()}>
              Resend code
            </Button>
          ) : null}
        </>
      ) : null}
    </form>
  );
}
