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

Backend command policy:

- The repository contract reserves `apps/api` for the Laravel backend.
- Do not add Composer, Artisan, Pint, PHPUnit, Pest, PHPStan, queue, scheduler, or migration commands to this file until `apps/api/composer.json` or equivalent backend files are checked in.
- When backend code is added, update this section in the same change so the documented commands remain executable and truthful.

## Safety rules

- Never run destructive database commands against an unknown environment.
- Never run `migrate:fresh`, `db:wipe`, or destructive seeders without explicit approval.
- Never run production deployment commands from an untrusted shell.
- Never print secrets from environment files.
