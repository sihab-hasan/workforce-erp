# Authentication Flow Audit — Complete Real Flow

Date: 2026-08-16

## Scope

End-to-end review of the Portal and Laravel API authentication path:

1. Password login
2. Email OTP request / verification
3. Google and Microsoft SSO
4. Token storage and API transport
5. `/api/v1/auth/me` session hydration
6. Protected-route authorization
7. Logout and revoked/expired-token handling
8. Invitation / organization-membership activation
9. Password recovery, password change, and session revocation
10. Admin app authentication boundary
11. Public Web → Portal login handoff
12. Local MySQL bootstrap for repeatable auth testing

## Final live flow

### Password

`LoginForm -> authenticationApi.login -> shared apiClient (public/no Bearer) -> POST /api/v1/auth/login -> LoginRequest -> AuthService -> Sanctum token -> shared AuthProvider -> protected routes`

Password login succeeds only for a user with at least one active organization membership.

### OTP

`MfaChallengeForm -> POST /auth/otp/request -> hashed 6-digit OTP -> email -> POST /auth/otp/verify -> invited membership activation (if applicable) -> Sanctum token -> shared AuthProvider`

OTP codes are hashed at rest, expire after five minutes, are single-use, and enforce an attempt limit. Request responses are generic and the one-minute resend cooldown is idempotent.

### SSO

`SocialLoginButtons -> GET /auth/sso/redirect/{provider} -> state + PKCE -> provider -> Portal callback -> POST /auth/sso/callback/{provider} -> existing eligible Workforce account -> optional invitation activation -> Sanctum token`

SSO is identity verification for an existing active/invited Workforce account. It does not self-register arbitrary Google/Microsoft users.

### Refresh / API 401

A stored token is checked through `/api/v1/auth/me` on Portal boot. A confirmed 401 clears the token/session. Temporary network/server failures preserve the token and show a retry screen instead of silently logging the user out. Protected feature APIs use the same centralized unauthorized handler.

## Problems found and fixed

- Blocked arbitrary SSO self-registration into tenant-less `users` records.
- Blocked password, OTP, and SSO sessions for users with no eligible organization membership.
- `workforce.active` invalidates stale browser sessions and revokes stale API tokens when all memberships become inactive/suspended/deleted.
- Portal/admin first-party browser auth uses Sanctum stateful sessions; JavaScript never receives or persists the session credential.
- Centralized token persistence/clear behavior in `@workforce-erp/auth-client`.
- Added centralized protected-request 401 handling so revoked/expired tokens sign the Portal out.
- Removed the extra `/me` round trip immediately after successful login/OTP/SSO; the validated auth response already contains the session payload.
- Prevented temporary API outages during boot from destroying a potentially valid stored session.
- Redirect authenticated users away from login/OTP screens while keeping real recovery routes available when needed.
- Normalized email input at Form Request boundaries and in rate-limit keys.
- Added dummy bcrypt verification for unknown password-login users to reduce timing discrepancy.
- Made OTP request cooldown responses consistent for eligible and unknown users.
- Unified invalid/missing/expired OTP verification errors.
- Google SSO now requires a verified provider email.
- SSO state remains one-time and PKCE-bound; provider HTTP calls use timeouts.
- Cleared client-side SSO state after both success and callback failure.
- Fixed OTP email text to match the actual five-minute backend expiry.
- OTP/SSO identity verification now records `email_verified_at`.
- Added real backend feature tests for password, OTP, and SSO flows.
- Replaced Portal login/OTP placeholder tests with real component tests.
- Added local-only MySQL bootstrap owner seeding for a fresh development database.
- Removed OTP secret logging and changed the example transport to real SMTP. Failed OTP delivery deletes the undelivered code.
- Added real forgot/reset password, password change, token-session list/revoke/logout-all flows.
- Added real owner/admin authentication to the Admin app.
- Fixed Web desktop/mobile Sign In links to use the configured Portal origin instead of the Web origin.
- Added `portal`/`admin` token naming so the Sessions page reflects the actual client.
- Added finite token expiry in the example configuration and concrete `expires_at` values so session expiry is visible and enforceable; expired Sanctum rows are pruned daily.
- Made invitation responses report whether email delivery actually succeeded instead of always claiming it was sent.
- Enabled `TrustHosts` with an environment-controlled hostname allowlist for auth/password-reset deployments.
- Protected the Portal wildcard/not-found surface so every non-auth Portal URL passes through the auth guard.
- Removed the unused public-Web auth-provider placeholder; Web stays public and hands sign-in to the real Portal origin.

## Local development account

Default `.env.example` values:

- Email: `owner@workforce.local`
- Password: `ChangeMe123!`
- Organization: `Workforce Local`

Create the MySQL database `workforce_erp`, then run:

```powershell
cd apps\api
composer install
php artisan config:clear
php artisan migrate
php artisan db:seed
cd ..\..
pnpm install
pnpm dev
```

The seeder only creates the bootstrap account in `APP_ENV=local`. Set `LOCAL_BOOTSTRAP_ENABLED=false` to disable it.

Configure a working SMTP service before testing invitation, OTP, or password-reset delivery. The application does not expose OTP codes in logs or simulate successful delivery.

## SSO requirements

Set valid provider credentials and register the exact callback URIs from `apps/api/.env`:

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_REDIRECT_URI`

The provider email must already belong to an active or invited Workforce account.

## Validation performed in the handoff environment

- PHP syntax: all API PHP files linted successfully.
- Shared `@workforce-erp/api-client`: TypeScript typecheck passed.
- Portal/Admin/Web/auth-client/api-client TypeScript/TSX source parse: 2,440 files checked with 0 syntax errors.
- OpenAPI: 32 paths / 37 operations / 205 local refs; 0 unresolved refs and 37/37 route-operation parity.
- Linux setup script: `bash -n` passed.
- Auth regression checks confirm public auth calls use `withAuth: false`, SSO no longer creates users, and session token writes are centralized.

### Runtime limitation

The handoff environment does not contain `apps/api/vendor` and cannot download Composer dependencies, so Laravel/PHPUnit runtime tests could not be executed here. The ZIP deliberately does not vendor dependencies. Run the following after `composer install` on your machine:

```powershell
cd apps\api
php artisan test --filter=AuthTest
php artisan test --filter=OTPTest
php artisan test --filter=SSOTest
php artisan test --filter=PasswordAuthTest
php artisan route:list --path=api/v1/auth
```

After `pnpm install`:

```powershell
pnpm --filter @workforce-erp/api-client typecheck
pnpm --filter @workforce-erp/portal test -- src/modules/core/authentication/tests
pnpm --filter @workforce-erp/portal typecheck
```

## Production hardening note

Checkpoint 1 currently keeps the existing Sanctum Bearer-token architecture because that is the repository contract used by the shared API client and mobile/server-capable API style. For a browser-only first-party Portal deployment, a dedicated follow-up should evaluate migrating the Portal to Sanctum's cookie/session SPA mode (CSRF-protected, HttpOnly session cookie) rather than persisting a personal access token in browser storage. This should be handled as one coordinated frontend/backend auth migration, not mixed halfway into the current token contract.

## 2026-08-16 production auth hardening

- First-party portal/admin login, OTP, and SSO now establish Laravel server-side sessions instead of returning personal access tokens.
- Session IDs stay in HttpOnly cookies; unsafe requests initialize Sanctum CSRF and send `X-XSRF-TOKEN`.
- Stateful Sanctum middleware is enabled for API routes and credentialed CORS is explicitly allowlisted.
- Database-backed encrypted sessions provide device/session listing and revocation.
- Logout invalidates the session and regenerates the CSRF token. Password reset/change revoke browser sessions and API tokens.
- Personal access tokens remain supported only for explicit non-browser integrations.
- Production deployment must use HTTPS, `SESSION_SECURE_COOKIE=true`, explicit `SANCTUM_STATEFUL_DOMAINS`, explicit `CORS_ALLOWED_ORIGINS`, and a shared parent `SESSION_DOMAIN` when apps run on sibling subdomains.
