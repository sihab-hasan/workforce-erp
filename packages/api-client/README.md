# @workforce-erp/api-client

Small fetch-based HTTP client shared by Web, ERP, and Admin.

It is backend-framework neutral but intentionally compatible with the Laravel API in `apps/api`:

- JSON requests and responses
- Bearer token authentication when used
- cookie credentials for Laravel Sanctum-style SPA authentication
- optional `X-XSRF-TOKEN`
- `X-Tenant-Key` and `X-Company-Key` context headers
- Laravel 422 `{ message, errors }` validation responses normalized to `ApiError`
- correlation and idempotency headers

Business endpoints do **not** belong in this package. They stay in app features or the Laravel API.
