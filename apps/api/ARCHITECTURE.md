# Workforce ERP API Architecture

This API follows the simple controller-to-service approach demonstrated by the referenced `api-sample`, extended with Laravel conventions required by a multi-tenant ERP.

## Request flow

```text
HTTP request
  -> API middleware / rate limiter
  -> Form Request validation
  -> v1 Controller
  -> Domain/Application Service
  -> OrganizationAccessService (tenant + role checks where needed)
  -> Eloquent models / database / external provider
  -> API Resource
  -> JSON envelope
```

## Layer responsibilities

### Routes — `routes/api.php`

- Keep URL/version/middleware composition here.
- Public auth routes are rate limited.
- User-facing protected routes use `auth:sanctum`.
- Machine routes use `service.account` plus explicit service permission/scope middleware.
- Test-only contract routes are available only in `local` and `testing`.

### Form Requests — `app/Http/Requests`

- Validate and normalize request-boundary input.
- Controllers consume only `validated()` input for writes and filters.
- Business authorization remains in services because it depends on organization membership and the target resource.

### Controllers — `app/Http/Controllers/Api/v1`

Controllers are intentionally thin. They:

1. receive validated requests / route-model-bound resources,
2. delegate work to a service,
3. transform returned models with API Resources,
4. preserve the published JSON response contract.

Controllers should not build tenant queries, run transactions, send mail, exchange OAuth tokens, or contain workflow rules.

### Services — `app/Services`

- `AuthService`: password/SSO browser authentication orchestration, account-state rules, session establishment, logout, and auth context.
- `VerificationChallengeService`: unified purpose-bound MFA/verification challenges for Authenticator App, Email Code, and SMS Code.
- `SsoService`: one-time provider state, S256 PKCE, redirect construction, bounded provider exchange/profile lookup and account linking.
- `UserService`: user directory, invitations, organization membership updates, employee linking and status changes.
- `EmployeeService`: tenant-scoped employee directory, options and summary KPIs.
- `TimesheetService`: scoped queries, server-authoritative live clock actions and manager correction CRUD.
- `OrganizationAccessService`: reusable organization membership/role boundaries.

Services return data/models rather than HTTP responses. Expected business failures use Laravel HTTP/authorization exceptions so the central exception handler can produce the standard API error envelope.

### API Resources — `app/Http/Resources`

Resources own output transformation. Queries and authorization do not belong in resources. Relationships needed by a resource should be eager-loaded in a service to avoid N+1 queries.

### Exception contract — `app/Exceptions/Handler.php`

API errors return a stable envelope:

```json
{
  "success": false,
  "message": "...",
  "errors": {}
}
```

Validation errors use HTTP 422, authentication 401, authorization 403, missing resources 404, conflicts 409, rate limits 429, and unexpected errors 500 without leaking stack traces.

## Authentication strategy

### Browser user traffic: Sanctum stateful sessions

ERP/Admin first-party browsers use Laravel Sanctum stateful authentication with database-backed sessions, HttpOnly cookies, CSRF protection, secure production cookies, session regeneration, absolute/idle expiry, and auth/authz version invalidation. Browser authentication tokens are not persisted in Web Storage.

Protected business endpoints are inside `auth:sanctum` and then pass the central tenant/authorization pipeline.

### Internal/server traffic: service accounts

Machine integrations use tenant-bound service accounts. Client credentials are hashed at rest and exchanged through `POST /api/v1/auth/service-token` for short-lived, audience-bound Bearer tokens. Machine routes require `service.account` and should additionally require explicit `service.permission:*` and `service.scope:*` middleware. Rotation, token revocation, account revocation, expiry, last-used metadata, and auditing are part of the service-account lifecycle. There is no global shared `X-API-TOKEN` bypass.

## Multi-tenant authorization

Organization membership is never inferred from request IDs alone. Services resolve active memberships before returning or mutating business data.

Current role boundaries:

- Users & Access management: `owner`, `admin`
- Timesheet management: `owner`, `admin`, `manager`
- Staff timesheet access: linked employee profile only
- Employee directory: active organization membership

A user-supplied organization/employee/timesheet ID is always checked against these boundaries before business actions proceed.

## Rate limiting

Named limiters are configured in `RouteServiceProvider` for:

- `login`
- `otp-request`
- `otp-verify`
- `sso`
- `service`
- the default authenticated/public API limiter

The OTP service also keeps its one-minute resend rule and failed-attempt limit as workflow-level controls. OTP values are hashed in persistent storage, and the public request response does not disclose account existence/state.

## SSO transaction security

Google and Microsoft authorization-code transactions store a single-use cache record containing the provider and PKCE verifier. The redirect carries only `state`, `code_challenge`, and `code_challenge_method=S256`; the verifier is sent directly from the API to the provider token endpoint during exchange and the cached transaction is consumed once. Provider HTTP calls use connect/request timeouts and connection failures map to a safe 502 response.

## Live attendance time authority

Clock-in and clock-out command endpoints derive timestamps from API server time. They reject client-provided clock timestamps and attendance metadata. Manager-authorized CRUD endpoints remain the explicit path for historical/manual corrections.

## Framework lifecycle

The repository targets Laravel 13 on PHP 8.3+. Composer must generate and validate the real Laravel 13 lockfile in a connected release environment, followed by migrations, route inspection, Pint, the full feature suite, dependency audit, and Portal/API integration checks before deployment.

## Adding a new module

Use this order:

1. Migration/model/relationship.
2. Form Request(s).
3. Service with tenant and workflow logic.
4. Thin v1 controller using constructor injection.
5. API Resource for output.
6. Versioned route with appropriate `auth:sanctum` or `service.account` + service permission/scope middleware, plus a named rate limiter where appropriate.
7. Feature tests for success, validation, unauthorized, cross-tenant access, and conflict cases.
8. Update the API README/OpenAPI contract and frontend shared client types if the public contract changed.

Avoid introducing a second HTTP response format, raw business queries in controllers, hard-coded secrets, or feature-specific authentication stacks.
