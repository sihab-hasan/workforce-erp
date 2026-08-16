# @workforce-erp/auth-client

Shared React authentication state for first-party Workforce ERP applications.

Browser credentials are intentionally **not** stored by this package. Laravel Sanctum owns the authenticated session through an HttpOnly cookie; this package stores only the non-sensitive user/session view in React memory.

Exports include `AuthProvider`, `useAuth`, `useSession`, `RequireAuth`, `createSession`, and auth types.
