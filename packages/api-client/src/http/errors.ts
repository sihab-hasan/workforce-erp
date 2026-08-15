/**
 * Custom error class representing API failures from the Laravel backend.
 */
export class ApiError extends Error {
  public status: number
  public errors?: Record<string, string[]>
  public rawResponse?: any

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>,
    rawResponse?: any
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.errors = errors
    this.rawResponse = rawResponse

    // Set the prototype explicitly to fix prototype chain issues when extending built-ins in ES5/ES6
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}
