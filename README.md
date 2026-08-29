# Workforce ERP

Multi-tenant, multi-company Workforce Management System organized as an **Nx + pnpm monorepo**.

This repository uses **Nx for task orchestration and caching**. It does **not** use Turborepo.

## Workspace

| Path              | Purpose                                               | Runtime      |
| ----------------- | ----------------------------------------------------- | ------------ |
| `apps/web`        | Public web application                                | React + Vite |
| `apps/erp`        | Workforce ERP application                             | React + Vite |
| `apps/admin`      | Platform administration                               | React + Vite |
| `apps/api`        | Laravel API + Sanctum                                 | PHP          |
| `services/worker` | Background jobs / notifications                       | Node.js      |
| `packages/*`      | Shared application libraries                          | TypeScript   |
| `tooling/*`       | Shared ESLint, Prettier, and TypeScript configuration | Node.js      |

Nx discovers the JavaScript/TypeScript projects from `pnpm-workspace.yaml`. The Laravel API is intentionally excluded from pnpm and is registered separately through `apps/api/project.json`, so it still appears in the Nx project graph.

## Prerequisites

- Node.js 22+
- pnpm 11.22.0 through Corepack
- PHP 8.3+ for the Laravel 13 API (Docker/CI currently use PHP 8.5)
- Composer 2

## First-time setup

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
pnpm validate
```

For the API:

```bash
cp apps/api/.env.example apps/api/.env
composer --working-dir=apps/api install
php apps/api/artisan key:generate
```

## Authentication & security release

The customer ERP uses first-party Sanctum cookie sessions with CSRF protection; browser authentication tokens are not stored in `localStorage`. Public browser routes use canonical paths such as `/sign-in`, `/sign-up`, `/verify-sign-in`, `/accept-invitation/:token`, and `/onboarding/*`; `/api/v1/auth/*` remains the internal API namespace.

Verification methods are limited to **Authenticator App (TOTP)**, **Email Code**, and **SMS Code**. Privileged accounts require verification before the final authenticated session is established. Tenant business requests require an explicit `X-Tenant-Key` and the backend verifies active membership, roles, permissions, data scope, policies, SoD/business rules, and step-up requirements. Platform administration has separate platform roles and `/api/v1/platform/*` authorization.

Run the source-only gate without installing dependencies:

```bash
python3 scripts/security-source-check.py
```

Run the complete production release gate in a connected build environment with Composer, pnpm, and Docker installed:

```bash
bash scripts/security-release-check.sh
# Windows PowerShell:
./scripts/security-release-check.ps1
```

See `docs/authentication-security.md`.

## Development

Run the frontend applications and worker together:

```bash
pnpm dev
```

Run the Laravel API in a second terminal:

```bash
pnpm dev:api
```

Individual targets are also available:

```bash
pnpm dev:web
pnpm dev:erp
pnpm dev:admin
pnpm dev:worker
```

Default local URLs:

- Web: `http://localhost:5173`
- ERP: `http://localhost:5174`
- Admin: `http://localhost:5175`
- API: `http://127.0.0.1:8000`

## Complete Docker + Nginx deployment

The repository includes a full production-style Docker stack with a public Nginx gateway, Web/ERP/Admin frontends, Laravel PHP-FPM + internal Nginx, MySQL, Redis, queue worker, scheduler, migrations, persistent uploads, and optional Let's Encrypt TLS.

```bash
bash scripts/docker-setup.sh
docker compose --env-file .env.docker -f infra/docker-compose.yml up -d --build
```

Default Docker URLs:

- Web: `http://web.localhost`
- ERP: `http://erp.localhost`
- Admin: `http://admin.localhost`
- API health: `http://api.localhost/api/health`

For real domains and HTTPS, configure `.env.docker` and run `bash scripts/docker-certbot.sh init`. See `infra/README.md` and `docs/deployment.md` for the full deployment runbook.

## Nx commands

```bash
pnpm show:projects
pnpm graph
pnpm nx show project @workforce-erp/erp
pnpm nx run @workforce-erp/erp:build
pnpm nx run @workforce-erp/api:test
```

Repository-wide Node checks:

```bash
pnpm check
```

Laravel checks after Composer dependencies are installed:

```bash
pnpm check:api
```

For pull-request style validation against the integration branch:

```bash
pnpm affected:check
```

The Nx default base is `develop`.

## Repository quality rules

- pnpm is the only JavaScript package manager for this repository.
- Nx is the only monorepo task orchestrator.
- Real `.env` files, Laravel runtime files, local SQLite databases, dependency directories, build output, and Nx cache data are ignored.
- Shared workspace packages must be declared explicitly with `workspace:*` in the consuming package.
- `pnpm check:imports` validates workspace imports and public package exports.
- GitHub Actions uses `nx affected` so unchanged Node projects are not rebuilt unnecessarily.

## GitHub CI

`.github/workflows/ci.yml` runs two reusable validation jobs:

1. **Node workspace** — repository validation, import-boundary checks, and Nx affected `typecheck`, `lint`, and `build` tasks.
2. **Laravel API** — Composer metadata validation, dependency installation, and the API test suite.

Nx affected CI works without Nx Cloud. Nx Cloud can be connected later if remote caching or distributed task execution is needed.

## GitHub push

The distributable ZIP intentionally does not contain another repository's `.git` directory. To publish it as a clean repository:

```bash
git init -b develop
git add .
git commit -m "chore: initialize Nx workforce ERP workspace"
git remote add origin <your-github-repository-url>
git push -u origin develop
```

If you are copying these files into an existing Git repository, keep that repository's own `.git` directory and commit the changes normally instead.

## Documentation

- `docs/setup.md` — local setup and Nx workflow
- `docs/architecture.md` — system boundaries and application overview
- `docs/authentication-security.md` — enterprise authentication, MFA, and security architecture
- `docs/access-control.md` — authorization model, roles, and scopes
- `docs/api-integration.md` — frontend/API integration contract
- `docs/code-ownership.md` — workspace layer boundaries and code ownership
- `docs/deployment.md` — deployment guidance and runbooks
- `infra/README.md` — Docker + Nginx stack and production orchestration
- `apps/api/README.md` — Laravel 13 API backend architecture and configuration
- `.github/GITHUB-CONFIG.md` — GitHub automation and repository configuration
