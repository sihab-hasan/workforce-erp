import { useState, type FormEvent } from "react";
import { Loader2, PhoneCall } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@workforce-erp/auth";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@workforce-erp/ui/components/input-otp";
import { Label } from "@workforce-erp/ui/components/label";
import { AuthCard } from "#features/authentication/components/AuthCard";
import { authenticationApi } from "#features/authentication/api/authentication.api";
import { ERP_PATHS } from "#routes/paths";

export default function VerifyPhonePage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [phone, setPhone] = useState("");
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function request(event: FormEvent) {
    event.preventDefault();
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      setError("Use E.164 format, for example +8801XXXXXXXXX.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await authenticationApi.requestPhoneChange(phone);
      setChallenge(r.challenge.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Phone verification could not start.");
    } finally {
      setLoading(false);
    }
  }
  async function confirm(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) return;
    setLoading(true);
    setError(null);
    try {
      await authenticationApi.confirmPhoneChange(challenge, code);
      signOut();
      navigate(`${ERP_PATHS.signIn}?phoneChanged=success`, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Phone verification failed.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthCard
      icon={<PhoneCall className="size-6" />}
      heading="Verify phone"
      subheading="Verify a new phone number with a single-use SMS code. This sensitive change requires recent verification."
    >
      {!challenge ? (
        <form className="space-y-4" onSubmit={request}>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+8801XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value.trim())}
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Sending…
              </>
            ) : (
              "Send SMS code"
            )}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={confirm}>
          <div className="flex flex-col items-center gap-3">
            <Label htmlFor="phone-code">6-digit SMS code</Label>
            <InputOTP
              id="phone-code"
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
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button className="w-full" disabled={loading || code.length !== 6}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Verifying…
              </>
            ) : (
              "Verify phone"
            )}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
