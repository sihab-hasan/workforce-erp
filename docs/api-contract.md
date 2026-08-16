# Workforce ERP API Contract

This document defines the canonical REST contract shared by the Laravel API, Portal, and `@workforce-erp/api-client`. The machine-readable contract lives at `packages/api-client/openapi/workforce-api.yaml`.

## 1. Routing and versioning

- Business API prefix: `/api/v1`
- Health endpoint: `/api/health`
- Current modules: authentication, users, employees, timesheets
- New breaking contracts require a new API version rather than silently changing existing client behavior.

Resource routes use nouns and HTTP verbs for actions. Workflow actions such as `clock-in`, `clock-out`, and `resend-invitation` remain explicit sub-routes because they represent commands rather than CRUD resources.

## 2. Authentication boundaries

### Portal / human users

Password, OTP, Google SSO, and Microsoft SSO all converge on Laravel Sanctum. Protected requests send:

```http
Authorization: Bearer <sanctum-token>
Accept: application/json
```

A valid token is not sufficient by itself for tenant data. Services also verify active organization membership, role, and target-resource ownership before queries or mutations are allowed.

Trusted host filtering is enabled at the Laravel HTTP boundary. Configure `TRUSTED_HOSTS` with the API hostnames accepted by each environment; do not use a wildcard hostname in production.

### Trusted server-to-server routes

`X-API-TOKEN` is supported only on routes explicitly using the `api.key` middleware, currently `/api/v1/internal/ping`.

```http
X-API-TOKEN: <API_SHARED_TOKEN>
```

The value comes from deployment environment configuration. `my-secret-token` is only a local/sample value and must not be used as a deployed secret. The shared key is not a replacement for Sanctum or tenant authorization on workforce data.

## 3. Success responses

Successful endpoints use a stable envelope:

```json
{
  "success": true,
  "message": "Optional operation message",
  "data": {
    "id": "123"
  }
}
```

- `success`: required and `true` for successful application responses.
- `message`: optional user-safe description.
- `data`: object, array, scalar, or omitted when no payload is needed.
- Creation endpoints normally return HTTP `201`.

Controllers should return data through `ApiResponseTrait` and API Resources rather than inventing module-specific response shapes.

## 4. Paginated collections

List endpoints accept `page` and `per_page`. `per_page` is capped at 100.

```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": [],
  "meta": {
    "current_page": 1,
    "from": null,
    "last_page": 1,
    "path": "http://localhost:8000/api/v1/employees",
    "per_page": 15,
    "to": null,
    "total": 0
  },
  "links": {
    "first": "http://localhost:8000/api/v1/employees?page=1",
    "last": "http://localhost:8000/api/v1/employees?page=1",
    "prev": null,
    "next": null
  }
}
```

Server-side filtering, searching, and pagination happen before response serialization. Clients must not fetch an unbounded collection and paginate it locally.

## 5. Error responses

All API errors use:

```json
{
  "success": false,
  "message": "Safe client-facing message",
  "errors": {}
}
```

`errors` is present when field-level details are useful, especially validation failures.

| HTTP  | Meaning                                                     |
| ----- | ----------------------------------------------------------- |
| `400` | Invalid workflow/provider input                             |
| `401` | Missing/invalid authentication credential                   |
| `403` | Authenticated but not authorized                            |
| `404` | Resource not found within the accessible scope              |
| `409` | Valid request conflicts with current resource state         |
| `419` | Invalid/expired SSO transaction state                       |
| `422` | Request validation failure                                  |
| `429` | Rate limit or workflow-attempt limit reached                |
| `502` | Upstream SSO provider temporarily unavailable               |
| `503` | Required server-side integration/configuration unavailable  |
| `500` | Unexpected server failure; internal details are not exposed |

Validation example:

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field must be a valid email address."]
  }
}
```

## 6. Request validation

Boundary validation belongs in `app/Http/Requests` Form Requests. Controllers consume validated input only.

Rules include:

- bounded search strings and authentication payload sizes;
- `per_page <= 100`;
- enum validation for roles/statuses;
- positive resource IDs;
- strict six-digit OTP input;
- live clock actions reject client-supplied clock timestamps or attendance metadata.

Live `/timesheets/clock-in` and `/timesheets/clock-out` use server time. Historical/manual corrections are made through manager-authorized timesheet CRUD endpoints.

## 7. Authentication workflow rules

### OTP

- OTP request responses do not disclose whether an account exists or is blocked.
- Codes are six digits and stored hashed in the database.
- OTPs expire, have resend throttling, and stop after the configured failed-attempt limit.
- Successful OTP verification issues the same Sanctum token shape used by other sign-in methods.
- Mail delivery failure deletes the undelivered OTP and never logs the code itself.

### Password recovery and account security

- Forgot-password responses are generic for unknown, blocked, and eligible addresses.
- Reset links are generated by Laravel's password broker and target the Portal reset route.
- Password reset and authenticated password change both revoke all existing Sanctum API tokens.
- Authenticated users can list their own Sanctum tokens, revoke one token, or revoke all tokens.
- Issued tokens receive a concrete expiry when `SANCTUM_TOKEN_EXPIRATION` is configured; the default example is eight hours.
- Expired token rows are pruned by the scheduled `sanctum:prune-expired` command.
- Portal/Admin clients identify the token origin as `portal` or `admin` so session records are not mislabeled.

### SSO

- Google and Microsoft use authorization-code flows.
- A random state transaction is single-use and expires from cache.
- PKCE uses a transaction-specific S256 challenge/verifier pair stored server-side with the state.
- Provider calls use bounded connection/request timeouts.
- SSO never self-registers a Workforce account. The provider email must match an existing active or invited organization member; a successful invited-user SSO activates that invitation.
- Provider failures return safe API errors without exposing credentials or raw provider responses.

## 8. Multi-tenant authorization

Request IDs never establish tenant access by themselves.

Current boundaries:

- Users & Access management: active `owner` / `admin` membership.
- Only an `owner` can assign or modify the `owner` role.
- The final active owner of an organization cannot be demoted/deactivated.
- Timesheet management: active `owner` / `admin` / `manager` membership.
- Staff timesheet access: their linked employee profile only.
- Employee directory: active organization membership only.

Every service that accepts an organization, employee, user, or timesheet target must constrain the target to organizations accessible by the authenticated actor.

## 9. Controller/service/resource pattern

New modules should follow:

```text
Route + middleware
  -> Form Request
  -> thin v1 Controller
  -> application/domain Service
  -> tenant/access service where required
  -> Eloquent / external provider
  -> API Resource
  -> ApiResponseTrait envelope
```

Controllers coordinate HTTP concerns. Business queries, transactions, mail delivery, OAuth exchange, and tenant workflow rules belong in services. API Resources serialize output and should not issue authorization queries.

## 10. Rate limits

The API group has a default limiter and sensitive flows add named limiters for login, OTP request/verify, password recovery/change, SSO, and trusted-service traffic. Workflow-level OTP resend/attempt controls apply in addition to HTTP rate limits.

## 11. OpenAPI and frontend compatibility

`packages/api-client/openapi/workforce-api.yaml` is the machine-readable route/schema/security contract. Any public contract change must update, in the same change set:

1. Laravel route/request/resource behavior;
2. OpenAPI path/schema/security definitions;
3. shared TypeScript types/client calls when affected;
4. feature tests;
5. this document or `apps/api/README.md` when operational behavior changes.

Feature modules must use `@workforce-erp/api-client` rather than adding independent raw `fetch` wrappers.

## 12. Safe change checklist

For each new API module:

1. Add/adjust schema and model relationships.
2. Add Form Requests with bounded validation.
3. Add service workflow and tenant authorization.
4. Add a thin versioned controller.
5. Add API Resources for public output.
6. Add route middleware/rate limits.
7. Add success, validation, unauthenticated, unauthorized/cross-tenant, conflict, and pagination tests as applicable.
8. Update OpenAPI and shared frontend types.
9. Run the test suite, Pint, route inspection, and non-destructive migration checks before merge.

Never commit real secrets or add a global sample token middleware to protected workforce routes.
