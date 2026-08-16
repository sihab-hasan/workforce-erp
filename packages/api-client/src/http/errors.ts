/**
 * Canonical error type for every HTTP consumer in the monorepo.
 */
export class ApiError extends Error {
  readonly status: number
  readonly statusText: string
  readonly body: unknown
  readonly errors?: Record<string, string[]>
  readonly rawResponse?: unknown

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>,
    rawResponse?: unknown,
    statusText = ""
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.statusText = statusText
    this.body = rawResponse
    this.errors = errors
    this.rawResponse = rawResponse
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}
