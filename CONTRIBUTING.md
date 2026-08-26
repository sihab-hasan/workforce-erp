# Contributing

## Branching

Use `develop` as the integration base unless the repository owner specifies another branch. Keep pull requests focused and avoid mixing unrelated refactors with feature work.

## Setup

Follow `docs/setup.md` before making changes.

## Before opening a pull request

Run:

```bash
pnpm check
```

If the Laravel API changed, also run:

```bash
pnpm check:api
```

Do not commit `.env` files, credentials, Laravel runtime logs/cache/session data, local SQLite databases, `node_modules`, Composer `vendor`, build output, or Nx cache data.

## Workspace boundaries

- Add cross-project JavaScript dependencies with `workspace:*` in the consuming package.
- Import shared code only through a package's public exports.
- Keep app-specific code inside its owning application.
- Use Nx targets for workspace build/lint/typecheck orchestration.
- Do not add Turborepo configuration or another workspace lockfile.
