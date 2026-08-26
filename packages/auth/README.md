# @workforce-erp/auth

Shared React authentication state for the minimized Workforce ERP applications, ported from the big project's `@workforce-erp/auth-client` package.

Browser credentials are intentionally **not** stored by the provider. Laravel Sanctum owns the authenticated session through an HttpOnly cookie; this package stores only the non-sensitive user/session view in React memory.

Exports include `AuthProvider`, `useAuth`, `useSession`, `RequireAuth`, `AuthGuard`, `createSession`, and auth types.
