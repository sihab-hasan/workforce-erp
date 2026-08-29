# Deployment

## Local source development

1. Copy `.env.example` to `.env`.
2. Run `pnpm validate` (or `pnpm connections:check`).
3. Start the Laravel API with `pnpm dev:api`.
4. Start the JavaScript applications with `pnpm dev`.

Default source-development URLs remain:

- Web: `http://localhost:5173`
- ERP: `http://localhost:5174`
- Admin: `http://localhost:5175`
- API: `http://127.0.0.1:8000`

## Complete Docker deployment

The production-style Docker stack is defined in `infra/docker-compose.yml` and includes Nginx gateway, all frontends, Laravel PHP-FPM, Laravel Nginx, MySQL, Redis, queue worker, scheduler, migrations, persistent storage, and optional Let's Encrypt services.

Initialize secure local secrets once:

```bash
bash scripts/docker-setup.sh
```

Start everything:

```bash
docker compose --env-file .env.docker -f infra/docker-compose.yml up -d --build
```

Default Docker URLs:

- Web: `http://web.localhost`
- ERP: `http://erp.localhost`
- Admin: `http://admin.localhost`
- API: `http://api.localhost`

The public Nginx gateway proxies `/api` and `/sanctum` from each frontend host to Laravel, keeping browser authentication same-origin. Laravel runs behind a private `api-nginx` + PHP-FPM pair and is not bound directly to a host port.

## Persistent data

Named volumes preserve:

- MySQL database data
- Redis AOF data
- Laravel `storage/app` uploads
- Certbot ACME webroot
- Let's Encrypt certificates

Use normal `docker compose down` for shutdown. `docker compose down -v` destroys these volumes and should not be used for routine deployment.

## Production HTTPS

Set real public hostnames and HTTPS public URLs in `.env.docker`, configure `TRUSTED_HOSTS`, `SANCTUM_STATEFUL_DOMAINS`, CORS origins, secure cookies, mail/SSO values, and DNS. Then set `LETSENCRYPT_EMAIL` and run:

```bash
bash scripts/docker-certbot.sh init
```

See `infra/README.md` for the complete runbook.

## Security release gate

Before a production deployment, run `bash scripts/security-release-check.sh` (or the PowerShell equivalent). The gate validates source security invariants, PHP/Composer/Laravel, PHPUnit, pnpm typecheck/lint/build/audit, migrations/routes, and Docker Compose configuration. It intentionally fails when required tooling or dependencies are unavailable.
