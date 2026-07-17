import { useRef, useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@workforce-erp/ui/components/button"
import { Input } from "@workforce-erp/ui/components/input"
import { cn } from "@workforce-erp/ui/lib/utils"

const CODE_LENGTH = 6

export interface MfaChallengeFormProps {
  className?: string
  onSuccess?: () => void
}

export function MfaChallengeForm({ className, onSuccess }: MfaChallengeFormProps) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const code = digits.join("")
  const isComplete = code.length === CODE_LENGTH && digits.every((d) => d !== "")

  function updateDigit(index: number, value: string) {
    // Accept only a single digit
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    setError(null)

    // Auto-advance
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH)
    const next = [...digits]
    pasted.split("").forEach((char, i) => {
      next[i] = char
    })
    setDigits(next)
    // Focus the last filled slot
    const lastIndex = Math.min(pasted.length, CODE_LENGTH - 1)
    inputRefs.current[lastIndex]?.focus()
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!isComplete) {
      setError("Please enter all 6 digits.")
      return
    }

    // Placeholder: simulate verification
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onSuccess?.()
    }, 1200)
  }

  return (
    <form
      id="mfa-challenge-form"
      onSubmit={handleSubmit}
      className={cn("flex flex-col items-center gap-6", className)}
      noValidate
    >
      {/* 6-digit OTP grid */}
      <div className="flex w-full justify-center gap-2" role="group" aria-label="One-time code">
        {digits.map((digit, i) => (
          <Input
            key={i}
            id={`mfa-digit-${i}`}
            ref={(el) => {
              inputRefs.current[i] = el
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            value={digit}
            onChange={(e) => updateDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            aria-label={`Digit ${i + 1}`}
            disabled={isLoading}
            className="h-11 w-10 text-center text-lg font-semibold tracking-widest"
          />
        ))}
      </div>

      {error && (
        <p id="mfa-error" role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      <Button
        type="submit"
        id="mfa-submit-button"
        size="lg"
        className="w-full"
        disabled={isLoading || !isComplete}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Verifying…
          </>
        ) : (
          "Verify code"
        )}
      </Button>
    </form>
  )
}
