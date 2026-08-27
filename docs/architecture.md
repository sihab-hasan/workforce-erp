# Architecture

Workforce ERP is a multi-tenant, multi-company workforce management system.

`Tenant → Companies → Departments → Employees`

## Applications

- `apps/web` — public website and authentication entry point (`5173` locally)
- `apps/erp` — tenant/company workforce workspace (`5174` locally)
- `apps/admin` — platform administration (`5175` locally)
- `apps/api` — Laravel API and Sanctum authentication service (`8000` locally)
- `services/worker` — background notifications/report jobs; no inbound HTTP port

The three browser applications are separate deployable frontends. Cross-app navigation is environment-driven through `VITE_WEB_URL`, `VITE_ERP_URL`, and `VITE_ADMIN_URL`.

## Browser/API boundary

Local browser requests use `/api` and `/sanctum` on the frontend origin. Vite proxies those paths to `VITE_API_PROXY_TARGET`, which defaults to `http://127.0.0.1:8000`. This preserves a clean Sanctum/CSRF flow during development.

For cross-origin staging/production, set `VITE_API_BASE_URL` and `VITE_API_URL` to the public API origin/prefix and configure the API's CORS, Sanctum stateful domains, trusted hosts, and session cookie domain consistently.

## Shared boundaries

- `packages/api-client` owns generic HTTP transport and cookie/CSRF-aware compatibility clients.
- `packages/contracts` owns cross-boundary TypeScript contracts.
- `packages/auth`, `packages/authorization`, and `packages/tenancy` own frontend integration abstractions, not backend enforcement.
- Laravel remains authoritative for authentication, authorization, validation, tenant/company isolation, and persistence.

See `docs/api-integration.md` for connection details.
