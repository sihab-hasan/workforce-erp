# @workforce-erp/api-client

Canonical frontend-to-backend HTTP transport for Workforce ERP.

First-party browser requests use Laravel Sanctum stateful SPA authentication: `credentials: include`, the HttpOnly Laravel session cookie, and automatic `XSRF-TOKEN` / `X-XSRF-TOKEN` handling for unsafe methods. No browser credential is read from or written to localStorage.

The package exports `createApiClient(options)` and the feature-module compatibility facade `createHttpClient()`. Both share query serialization, cancellation, normalized `ApiError` handling, credentialed requests, and CSRF initialization.

Personal access tokens remain a backend capability for explicitly non-browser API clients; the browser transport does not create or persist them.
