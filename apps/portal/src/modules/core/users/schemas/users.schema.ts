import type { UserRole } from "../types/users.types"

/**
 * Shared validation helpers for the Users module.
 *
 * We use plain TypeScript-based validation instead of an external schema
 * library because the portal does not yet have zod / react-hook-form
 * installed. These utilities are intentionally lightweight and easily
 * replaceable with a schema library if one is added in the future.
 */

// ---------------------------------------------------------------------------
// Field validators — return an error string or undefined (valid)
// ---------------------------------------------------------------------------

export function validateName(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return "Name is required."
  if (trimmed.length < 2) return "Name must be at least 2 characters."
  if (trimmed.length > 100) return "Name must be 100 characters or fewer."
  return undefined
}

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return "Email address is required."
  // Basic RFC 5321 check: something@something.something
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) return "Please enter a valid email address."
  return undefined
}

export function validateRole(value: string | undefined): string | undefined {
  if (!value) return "Role is required."
  const validRoles: UserRole[] = [
    "owner",
    "admin",
    "manager",
    "staff",
    "readonly",
  ]
  if (!validRoles.includes(value as UserRole))
    return "Please select a valid role."
  return undefined
}

export function validateOrganization(
  value: string | undefined,
  isRequired = false
): string | undefined {
  if (isRequired && !value) return "Organization is required."
  return undefined
}

// ---------------------------------------------------------------------------
// Form state helpers
// ---------------------------------------------------------------------------

export type FieldErrors<T extends object> = Partial<Record<keyof T, string>>

/**
 * Returns true when the errors object contains no defined error strings.
 */
export function isValid<T extends object>(errors: FieldErrors<T>): boolean {
  return Object.values(errors).every((v) => v === undefined)
}
