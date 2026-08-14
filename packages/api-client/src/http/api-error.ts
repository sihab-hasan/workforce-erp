/**
 * Typed API error returned when the server responds with a non-2xx status.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown
  ) {
    super(`API error ${status}: ${statusText}`)
    this.name = "ApiError"
  }
}
