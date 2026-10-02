# Workforce ERP

Multi-tenant, multi-company Workforce Management System organized as an **Nx + pnpm monorepo**.

This repository uses **Nx for task orchestration and caching**. It does **not** use Turborepo.

## Workspace

| Path         | Purpose                                               | Runtime      |
| ------------ | ----------------------------------------------------- | ------------ |
| `apps/web`   | Public web application                                | React + Vite |
| `apps/erp`   | Workforce ERP application                             | React + Vite |
| `apps/admin` | Platform administration                               | React + Vite |
| `apps/api`   | Laravel API + Sanctum                                 | PHP          |
| `packages/*` | Shared application libraries                          | TypeScript   |
| `tooling/*`  | Shared ESLint, Prettier, and TypeScript configuration | Node.js      |

Nx discovers the JavaScript/TypeScript projects from `pnpm-workspace.yaml`. The Laravel API is intentionally excluded from pnpm and is registered separately through `apps/api/project.json`, so it still appears in the Nx project graph.

## Prerequisites

- Node.js 22+
- pnpm 11.22.0 through Corepack
- PHP 8.4+ for the Laravel 13 API (CI uses PHP 8.5)
- Composer 2
- Docker Desktop with Docker Compose (optional local container stack)

## First-time setup

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
```

For the API:

```bash
cp apps/api/.env.example apps/api/.env
composer --working-dir=apps/api install
php apps/api/artisan key:generate
```

## Authentication & security

The customer ERP uses first-party Sanctum cookie sessions with CSRF protection; browser authentication tokens are not stored in `localStorage`. Public browser routes use canonical paths such as `/sign-in`, `/sign-up`, `/verify-email`, `/accept-invitation/:token`, and `/onboarding/*`; `/api/v1/auth/*` remains the internal API namespace.

Registration requires email verification. Password, Google, and Microsoft sign-in establish a session directly; Authenticator App (TOTP), Email Code, and SMS Code remain available for step-up verification of sensitive actions. Tenant business requests require an explicit `X-Tenant-Key` and the backend verifies active membership, roles, permissions, data scope, policies, SoD/business rules, and step-up requirements. Platform administration has separate platform roles and `/api/v1/platform/*` authorization.

## Development

Run the frontend applications together:

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
```

Default local URLs:

- Web: `http://localhost:5173`
- ERP: `http://localhost:5173/erp/`
- Admin: `http://localhost:5173/admin/`
- API: `http://127.0.0.1:8000`

## Optional Docker Desktop stack

The local Docker Compose stack uses Caddy, PHP/Apache, MySQL, and Redis. It sends email through Gmail SMTP and serves HTTP from one `localhost` origin; production deployment and TLS will be configured later.

```bash
cp .env.docker.example .env.docker
```

Generate an application key with Docker and put the result in `APP_KEY` in `.env.docker`:

```bash
docker run --rm php:8.5-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

Start or stop the local stack:

```bash
pnpm docker:build
pnpm docker:down
```

Open Web at `http://localhost:8080`, ERP at `http://localhost:8080/erp/`, Admin at `http://localhost:8080/admin/`, and API at `http://localhost:8080/api`.

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
- GitHub Actions uses `nx affected` so unchanged Node projects are not rebuilt unnecessarily.

## GitHub CI

`.github/workflows/ci.yml` runs two reusable validation jobs:

1. **Node workspace** — formatting checks and Nx affected `typecheck`, `lint`, and `build` tasks.
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

## Project references

- `infra/README.md` — local Docker Desktop stack; production deployment is not configured yet
- `apps/api/README.md` — Laravel 13 API backend architecture and configuration
- `.github/GITHUB-CONFIG.md` — GitHub automation and repository configuration
