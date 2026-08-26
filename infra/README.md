# Infrastructure

`infra/docker-compose.yml` builds the three static frontend applications plus the Node worker. The Laravel API lives in `apps/api` but is intentionally run/deployed independently from this Compose stack so database, queue, cache, scheduler, migrations, and secrets can be operated as backend concerns.

Host ports default to Web `5173`, ERP `5174`, and Admin `5175`; each frontend container listens on port `80` internally and exposes `/healthz` for container health checks.

Browser build-time endpoints use `PUBLIC_WEB_URL`, `PUBLIC_ERP_URL`, `PUBLIC_ADMIN_URL`, `PUBLIC_API_BASE_URL`, and `PUBLIC_API_URL`. The worker uses `WORKER_API_URL` because server-to-server routing is different from browser routing.

For local Docker with the Laravel API running on the host, `WORKER_API_URL` defaults to `http://host.docker.internal:8000/api` and Compose registers `host.docker.internal:host-gateway` for Linux compatibility.

For staging/production, set all public URLs to HTTPS endpoints and configure the API's CORS/Sanctum/session environment for exactly those origins.
