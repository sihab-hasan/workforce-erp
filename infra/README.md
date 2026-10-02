# Local Docker Desktop Stack

This Compose stack is for local development and is not production-ready. It uses Caddy for static frontend hosting and same-origin API routing, PHP/Apache for Laravel, MySQL, Redis, and Laravel queue/scheduler processes. Outgoing mail uses Gmail SMTP.

## Start

Copy the example environment and set a valid Laravel `APP_KEY` before building:

```bash
cp .env.docker.example .env.docker
docker run --rm php:8.5-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

Paste the generated key into `.env.docker`, then start the containers:

```bash
pnpm docker:build
```

Local URLs (single origin, no subdomains):

- Web: `http://localhost:8080`
- ERP: `http://localhost:8080/erp/`
- Admin: `http://localhost:8080/admin/`
- API: `http://localhost:8080/api`

## Gmail SMTP

Set `MAIL_USERNAME` and `MAIL_FROM_ADDRESS` to the Google account address, and `MAIL_PASSWORD` to a Google App Password. App Passwords require 2-Step Verification; do not use your normal Google account password. Keep the App Password only in the ignored `.env.docker` file.

Stop the stack with `pnpm docker:down`. This removes containers and the network but preserves named MySQL, Redis, and upload volumes. Do not add `-v` unless intentionally deleting local data.

## Production

The stack uses local hostnames and HTTP only. Production domains, TLS, secret management, and deployment automation will be configured after the hosting target is chosen.
