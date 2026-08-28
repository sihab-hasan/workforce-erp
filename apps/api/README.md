# Workforce ERP API Backend

Canonical Laravel 13 API for Workforce ERP. The Portal consumes this service through the shared `@workforce-erp/api-client` transport.

The implementation follows the referenced `api-sample`'s easy-to-follow **route -> controller -> service -> model** approach, then adds Form Requests, centralized tenant access rules, API Resources, Sanctum, named rate limiting and feature tests for the ERP use case. See [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Current capabilities

- Versioned JSON APIs under `/api/v1`
- Laravel Sanctum bearer-token authentication (`login`, `me`, session list/revoke, `logout`, `logout-all`)
- Passwordless email OTP authentication with hashed-at-rest codes and non-enumerating request responses
- Real password recovery via Laravel password broker plus authenticated password change; both recovery/change revoke existing API sessions
- Google and Microsoft SSO authorization-code flows with one-time state, PKCE (S256), and provider timeouts
- Tenant-aware Users APIs for owner/admin user management
- Tenant-aware Employee directory list/options/summary APIs
- Timesheet list, server-authoritative clock-in/clock-out, current-day status, and manager correction CRUD APIs
- Form Request validation at the HTTP boundary
- Constructor-injected services for business workflows
- Central organization/role authorization service
- Active-membership middleware on every Sanctum-protected Workforce route
- Consistent success/error/validation envelopes and server-side pagination
- Named rate limits for login, OTP, SSO and internal service traffic
- Tenant-bound service accounts with scoped, short-lived Bearer tokens for server-to-server routes

## Local setup

From the repository root:

```bash
./infra/scripts/setup.sh
```

On Windows PowerShell:

```powershell
./infra/scripts/setup.ps1
```

To set up only the API manually with the default MySQL development configuration:

```bash
cd apps/api
composer install
cp .env.example .env
php artisan key:generate
# Create the MySQL database `workforce_erp`, then:
php artisan migrate
php artisan db:seed
php artisan serve --host=localhost --port=8000
```

On XAMPP, start MySQL before running the migration. The local bootstrap seeder is disabled by default. To create a local owner, set `LOCAL_BOOTSTRAP_ENABLED=true` and choose a non-empty `LOCAL_BOOTSTRAP_OWNER_PASSWORD` in your untracked `apps/api/.env` before running the seeder.

The Portal Vite dev server proxies `/api` to `http://localhost:8000`. To target another backend, set `VITE_API_BASE_URL` for the Portal.

## Authentication

### Portal / user routes

Password, Google SSO, and Microsoft SSO are the supported primary user authentication methods. Required MFA is completed before a final privileged browser session is established. First-party ERP/Admin browser clients use Laravel Sanctum stateful authentication with database-backed HttpOnly cookies and CSRF protection; browser auth tokens are not stored in `localStorage`.

Business routes are protected with `auth:sanctum`, explicit tenant context, active membership, permissions, data scopes, resource policies, SoD/business rules, and subscription/module entitlements as applicable.

Optional token lifetime and browser CORS origins are environment-driven:

```dotenv
SANCTUM_TOKEN_EXPIRATION=480
SANCTUM_TOKEN_PREFIX=workforce_
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175
TRUSTED_HOSTS=localhost,localhost
```

The example uses an eight-hour (`480` minute) token lifetime. Set `SANCTUM_TOKEN_EXPIRATION` to the session lifetime required by the deployment; leaving it blank opts back into Sanctum's non-expiring personal-access-token behavior. Issued token rows also receive a concrete `expires_at`, so the Sessions page reports the real expiry. Set `TRUSTED_HOSTS` to the API hostnames accepted by the deployment; the local example permits only `localhost` and `localhost`.

### Service-account authentication

Server-to-server integrations use dedicated service accounts rather than employee identities or a shared global token. An authorized tenant administrator creates a service account, assigns explicit permissions and data scopes, and receives a client credential only at creation/rotation time. The worker exchanges that credential for a short-lived audience-bound Bearer token at `POST /api/v1/auth/service-token`.

Protected machine endpoints use `service.account` plus explicit `service.permission:*` and `service.scope:*` middleware. Credentials and access tokens are hashed at rest, support rotation/revocation/expiry, and never default to wildcard permissions.

The optional Node worker accepts `WORKER_SERVICE_CLIENT_ID`, `WORKER_SERVICE_CLIENT_SECRET`, and `WORKER_SERVICE_AUDIENCE` from deployment secret management. Never commit real service credentials.

## ERP + API development

Terminal 1:

```bash
pnpm dev:api
```

Terminal 2:

```bash
pnpm dev:erp
```

Open `http://localhost:5174/`.

## SSO configuration

Set provider credentials in `apps/api/.env`:

```dotenv
PORTAL_URL=http://localhost:5174/portal
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5174/sso/callback/google
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=http://localhost:5174/sso/callback/microsoft
```

The redirect URIs must also be registered with Google/Microsoft. The API rejects SSO redirect requests when provider credentials are missing. Each SSO transaction generates a one-time state plus an S256 PKCE verifier/challenge pair; the verifier stays server-side and is consumed with the state during the callback. Provider HTTP calls have bounded connect/request timeouts.

## Mail / OTP / password recovery

Authentication email delivery is real SMTP; OTP values and password-reset tokens are never exposed through application logs. The `.env.example` points to `localhost:1025`, so run a local SMTP catcher such as Mailpit-compatible SMTP or replace those settings with a real provider before testing invitations, OTP, or password recovery. If OTP delivery fails, the undelivered OTP row is deleted. Public OTP/password-recovery responses remain deliberately generic so account existence or eligibility is not disclosed.

OTP values are stored as password hashes rather than plaintext, expire after five minutes, and are single-use. Laravel's password broker owns password-reset token creation/validation; reset links target the configured `PORTAL_URL`. Password reset and authenticated password change revoke all existing Sanctum tokens and require a fresh sign-in. Expired token rows are pruned daily by the Laravel scheduler.

Live clock-in/clock-out actions use API server time and reject client-supplied `clock_in` / `clock_out` timestamps. Managers use the authenticated manual timesheet CRUD endpoints for corrections.

## Framework lifecycle note

This V1 source targets Laravel 13 with PHP 8.3+. The release environment must run Composer with network access to generate a fresh lockfile and validate Sanctum, PHPUnit, migrations, middleware, dependency audit, and deployment compatibility before production promotion.

## Validation and testing

```bash
cd apps/api
composer test
composer exec pint -- --test
```

Useful non-destructive checks:

```bash
php artisan route:list --path=api/v1
php artisan migrate:status
php artisan migrate --pretend
```

Feature tests cover the API envelope, schema, password auth, OTP, SSO, pagination, Users authorization, Timesheet actions and the optional internal API-key middleware.
