import * as React from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@workforce-erp/ui/components/input-otp";
import { cn } from "@workforce-erp/ui/lib/utils";

export interface OtpChallengeInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  length?: number;
  maxLength?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
  onComplete?: (code: string) => void;
}

export function OtpChallengeInput({
  id,
  value,
  onChange,
  length = 6,
  maxLength,
  disabled = false,
  autoFocus = true,
  autoComplete = "one-time-code",
  inputMode = "numeric",
  className,
  onComplete,
}: OtpChallengeInputProps) {
  const actualLength = maxLength ?? length;
  const halfLength = Math.floor(actualLength / 2);

  return (
    <div className={cn("flex justify-center", className)}>
      <InputOTP
        id={id}
        maxLength={actualLength}
        value={value}
        onChange={(val) => {
          onChange(val);
          if (val.length === actualLength) {
            onComplete?.(val);
          }
        }}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        inputMode={inputMode}
      >
        <InputOTPGroup>
          {Array.from({ length: halfLength }).map((_, index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          {Array.from({ length: actualLength - halfLength }).map((_, index) => (
            <InputOTPSlot key={index + halfLength} index={index + halfLength} />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
