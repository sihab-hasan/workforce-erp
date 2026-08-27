# API integration

Browser applications use two related settings:

- `VITE_API_BASE_URL`: API origin/root. Leave blank for same-origin development.
- `VITE_API_URL`: canonical API prefix. Defaults to `/api` locally.

In local development, Vite proxies `/api` and `/sanctum` to `VITE_API_PROXY_TARGET` (default `http://127.0.0.1:8000`). This is the preferred Laravel Sanctum connection because cookies and CSRF requests remain same-origin from the browser's perspective.

Transferred big-version feature modules use absolute backend paths such as `/api/v1/employees`, so they bind to `VITE_API_BASE_URL`. New prefix-relative API client calls bind to `VITE_API_URL`.

The worker is server-to-server and does not use the browser proxy. Configure its absolute `API_URL` locally or `WORKER_API_URL` in Docker.

Before running the stack, use `pnpm connections:check` to validate ports and URLs.
