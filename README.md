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

The local Docker Compose stack uses Nginx, PHP/Apache, MySQL, and Redis. It sends email through Gmail SMTP and serves HTTP from one `localhost` origin; production deployment and TLS will be configured later.

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

## Production Deployment (Live)

Workforce ERP is deployed live on Ubuntu VPS with automated CI/CD:

- **Live Application:** [http://workforce.austattendance.online](http://workforce.austattendance.online)
- **ERP Workspace:** [http://workforce.austattendance.online/erp/](http://workforce.austattendance.online/erp/)
- **Admin Console:** [http://workforce.austattendance.online/admin/](http://workforce.austattendance.online/admin/)
- **API Health Check:** [http://workforce.austattendance.online/api/healthz](http://workforce.austattendance.online/api/healthz)

### Hosting Architecture

- **Host Web Server:** Nginx 1.24+ reverse proxy serving static SPAs with same-origin routing to PHP-FPM.
- **PHP Engine:** PHP 8.4-FPM running via dedicated Unix domain socket (`/run/php/php8.4-fpm-s20230204060.sock`).
- **Database:** MySQL 8.4 hosted in shared container `cse3100-db` on the VPS host.
- **CI/CD Pipeline:** Fully automated GitHub Actions workflow (`.github/workflows/deploy.yml`) triggered on push to `main`.

### CI/CD Workflow (`.github/workflows/deploy.yml`)

The pipeline implements an automated 4-stage deployment architecture:

1. **`test` Stage:** Runs repository-wide TypeScript typechecking and Laravel API feature tests.
2. **`build` Stage:** Installs production PHP dependencies, compiles all 3 React SPAs (`web`, `erp`, `admin`) via Nx, packages the release archive `release.tar.gz` with zero secrets, and uploads the deployment artifact.
3. **`deploy` Stage:** Authenticates using dedicated deploy SSH keys, transfers the bundle via SCP, extracts to `~/laravel`, executes `php artisan migrate --force`, and rebuilds Laravel caches via `php artisan optimize`.
4. **`release` Stage:** Automatically tags the commit and publishes a GitHub Release with changelog notes.

### Required GitHub Repository Secrets

Configure the following secrets in GitHub Repository Settings (`Settings -> Secrets and variables -> Actions`):

| Secret Name       | Description                            |
| :---------------- | :------------------------------------- |
| `SSH_PRIVATE_KEY` | Dedicated SSH private deploy key       |
| `DEPLOY_USER`     | VPS username (`s20230204060`)          |
| `DEPLOY_HOST`     | VPS host IP address (`187.52.122.100`) |
| `DEPLOY_PORT`     | SSH port (default: `22`)               |

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

## Project references

- `infra/README.md` — local Docker Desktop stack and production VPS hosting architecture
- `apps/api/README.md` — Laravel 13 API backend architecture and configuration
- `.github/GITHUB-CONFIG.md` — GitHub automation and repository configuration
