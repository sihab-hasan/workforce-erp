# Local setup

## Requirements

- Node.js 22+
- pnpm 11.22.0 through Corepack
- PHP 8.3+ for the Laravel 13 API (Docker and CI use PHP 8.5)
- Composer 2
- MySQL 8.0+ (or Docker MySQL)

## Install the Node workspace

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
pnpm validate
```

`pnpm-workspace.yaml` contains only JavaScript/TypeScript projects. Laravel is deliberately excluded from pnpm dependency linking.

## Install the Laravel API

```bash
cp apps/api/.env.example apps/api/.env
composer --working-dir=apps/api install
php apps/api/artisan key:generate
php apps/api/artisan migrate
# Optional local bootstrap data:
php apps/api/artisan db:seed
```

## Start development services

Start Web, ERP, Admin, and Worker through Nx:

```bash
pnpm dev
```

Start Laravel through its Nx project target in another terminal:

```bash
pnpm dev:api
```

Local endpoints:

- Web: `http://localhost:5173`
- ERP: `http://localhost:5174`
- Admin: `http://localhost:5175`
- API: `http://127.0.0.1:8000`

The browser apps use same-origin `/api` and `/sanctum` requests during local development. Vite proxies those paths to `VITE_API_PROXY_TARGET`.

## Nx workflow

Useful commands:

```bash
pnpm show:projects
pnpm graph
pnpm nx show project @workforce-erp/web
pnpm nx run @workforce-erp/web:build
pnpm nx run @workforce-erp/api:test
pnpm affected:check
```

The integration base in `nx.json` is `develop`.

## Validation

Node workspace:

```bash
pnpm check
```

Laravel API after Composer install:

```bash
pnpm check:api
```

Connection and repository configuration only:

```bash
pnpm validate
```
