# Docker + Nginx Infrastructure

This directory now contains the complete application stack:

- `gateway` — public Nginx reverse proxy on ports 80/443
- `web` — Vite Web SPA served by Nginx
- `erp` — Vite ERP SPA served by Nginx
- `admin` — Vite Admin SPA served by Nginx
- `api-nginx` — internal Nginx for Laravel's `public/` directory
- `api` — PHP 8.5 FPM Laravel runtime
- `api-migrate` — one-shot production migration service
- `queue` — Laravel Redis queue worker
- `scheduler` — Laravel scheduler worker
- `mysql` — MySQL 8.4 with a persistent volume
- `redis` — Redis with AOF persistence and password auth
- `worker` — optional Node worker (`node-worker` profile)
- `certbot` / `certbot-renew` — Let's Encrypt issuance and renewal

## First run

From the repository root:

```bash
bash scripts/docker-setup.sh
docker compose --env-file .env.docker -f infra/docker-compose.yml up -d --build
```

Default local URLs:

- Web: `http://web.localhost`
- ERP: `http://erp.localhost`
- Admin: `http://admin.localhost`
- API health: `http://api.localhost/api/health`
- Gateway health: `http://127.0.0.1/healthz`

Modern browsers resolve `*.localhost` to loopback. If your environment does not, add these names to `/etc/hosts` (or the Windows hosts file):

```text
127.0.0.1 web.localhost erp.localhost admin.localhost api.localhost
```

## Useful commands

```bash
# status
docker compose --env-file .env.docker -f infra/docker-compose.yml ps

# logs
docker compose --env-file .env.docker -f infra/docker-compose.yml logs -f --tail=200

# Laravel shell
docker compose --env-file .env.docker -f infra/docker-compose.yml exec api php artisan about

# rerun migrations
docker compose --env-file .env.docker -f infra/docker-compose.yml run --rm api-migrate

# stop
docker compose --env-file .env.docker -f infra/docker-compose.yml down

# stop and DELETE database/Redis/uploads/certificates
docker compose --env-file .env.docker -f infra/docker-compose.yml down -v
```

Do not use `down -v` on a server unless you intentionally want to destroy persistent data.

## Production domains

Before the first production build, edit `.env.docker` and replace the local hostnames with your real domains. Example:

```dotenv
WEB_HOST=www.example.com
ERP_HOST=erp.example.com
ADMIN_HOST=admin.example.com
API_HOST=api.example.com

PUBLIC_WEB_URL=https://www.example.com
PUBLIC_ERP_URL=https://erp.example.com
PUBLIC_ADMIN_URL=https://admin.example.com
APP_URL=https://api.example.com
PORTAL_URL=https://erp.example.com/portal

TRUSTED_HOSTS=www.example.com,erp.example.com,admin.example.com,api.example.com
SANCTUM_STATEFUL_DOMAINS=www.example.com,erp.example.com,admin.example.com,api.example.com
CORS_ALLOWED_ORIGINS=https://www.example.com,https://erp.example.com,https://admin.example.com,https://api.example.com
SESSION_SECURE_COOKIE=true
```

The frontends use same-origin `/api` and `/sanctum` routes through the gateway, so `PUBLIC_API_BASE_URL` should normally remain blank and `PUBLIC_API_URL=/api`.

## HTTPS / Let's Encrypt

Point all four DNS records to the server first and allow inbound TCP 80 and 443. Set:

```dotenv
LETSENCRYPT_EMAIL=admin@example.com
```

Then run:

```bash
bash scripts/docker-certbot.sh init
```

The script obtains one SAN certificate containing all four hosts, enables the TLS Nginx template, starts automatic Certbot renewal, and switches HTTP traffic to HTTPS redirects. The gateway reloads periodically to pick up renewed certificates.

Manual renewal test/renewal:

```bash
bash scripts/docker-certbot.sh renew
```

## Optional Node worker

Set `WORKER_ENABLED=true` and a valid `WORKER_JOBS_PATH`, then either set `COMPOSE_PROFILES=node-worker` or run:

```bash
docker compose --env-file .env.docker -f infra/docker-compose.yml --profile node-worker up -d worker
```
