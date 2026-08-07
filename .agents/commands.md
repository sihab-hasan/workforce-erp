# Commands

This file must match the real scripts in `package.json`, workspace package files, and `composer.json`.
Do not invent commands. Update this file when scripts change.

This repository is organized for a full-stack architecture, but only commands backed by files currently checked in may appear here.

## Root workspace

Install:

```bash
pnpm install
```

Development:

```bash
pnpm dev
```

Full local Docker stack:

```bash
pnpm run docker:up
pnpm run docker:down
```

Lint:

```bash
pnpm lint
```

Type check:

```bash
pnpm typecheck
```

Build:

```bash
pnpm build
```

Validation gate used in CI and local review:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
```

Changed-workspace examples:

```bash
pnpm --filter @workforce-erp/admin lint
pnpm --filter @workforce-erp/api test
pnpm --filter @workforce-erp/portal typecheck
pnpm --filter @workforce-erp/web build
pnpm --filter @workforce-erp/ui lint
```

Turborepo examples:

```bash
pnpm turbo run lint typecheck build
pnpm turbo run lint --filter=@workforce-erp/admin
```

## Laravel API

Canonical path:

```bash
cd apps/api
```

From the repository root:

```bash
composer --working-dir=apps/api install
pnpm --filter @workforce-erp/api dev
pnpm --filter @workforce-erp/api lint
pnpm --filter @workforce-erp/api test
pnpm --filter @workforce-erp/api build
```

`pnpm dev` runs the Turborepo development servers directly. `pnpm run up`
builds and starts the complete container stack behind Nginx at
`http://localhost:3000`; `pnpm run down` stops it. The container network keeps
application, PostgreSQL, and Redis ports private.

## Safety rules

- Never run destructive database commands against an unknown environment.
- Never run `migrate:fresh`, `db:wipe`, or destructive seeders without explicit approval.
- Never run production deployment commands from an untrusted shell.
- Never print secrets from environment files.
