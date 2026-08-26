# Deployment

## Local development

1. Copy `.env.example` to `.env`.
2. Run `pnpm validate` (or `pnpm connections:check`).
3. Start the Laravel API with `pnpm dev:api`.
4. Start the JavaScript applications and worker with `pnpm dev`.

Default URLs:

- Web: `http://localhost:5173`
- ERP: `http://localhost:5174`
- Admin: `http://localhost:5175`
- API: `http://127.0.0.1:8000`

Vite uses strict ports and proxies `/api` plus `/sanctum` to the API server.

## Docker frontends + worker

Run:

```bash
docker compose -f infra/docker-compose.yml up --build
```

The Compose file builds Web, ERP, Admin, and Worker. The Laravel API is intentionally run/deployed separately so its database, queue, cache, scheduler, and secret lifecycle can be managed independently.

Frontend host ports are controlled by `WEB_PORT`, `ERP_PORT`, and `ADMIN_PORT`. Build-time public endpoints use `PUBLIC_WEB_URL`, `PUBLIC_ERP_URL`, `PUBLIC_ADMIN_URL`, `PUBLIC_API_BASE_URL`, and `PUBLIC_API_URL`. The worker uses `WORKER_API_URL` because its server-to-server network path is different from browser routing.

Each frontend image exposes `/healthz`; Compose/Docker can use the image health check without treating a running Nginx process as proof that the static app is serving correctly.

## Production

Use HTTPS URLs for every public application. If the applications and API are sibling subdomains, configure the Laravel API with the exact browser origins/stateful domains, a shared parent session domain when required, secure cookies, and trusted proxy/host settings. Do not ship `localhost` public URLs in a production build.
