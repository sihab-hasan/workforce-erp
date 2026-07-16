# Architecture

## Current shape

The repository is a frontend-first `pnpm` monorepo using Turborepo.
It currently contains three Vite + React applications and a set of shared internal packages.

## Application layer

- `apps/web`: public-facing app on port `5173`
- `apps/portal`: tenant portal on port `5174`
- `apps/admin`: admin-facing app on port `5175`

## Shared package layer

- `packages/ui`: shared components, styling primitives, and package-level shadcn/ui setup
- `packages/config/*`: shared ESLint and TypeScript configuration packages
- `packages/constants`: shared constants and route helpers
- `packages/api-client`: shared API client foundation plus OpenAPI and codegen scaffolding
- `packages/auth-client`: shared auth context, hooks, session helpers, and route guards
- `packages/permissions`: shared permission checks, hooks, and guard components
- `packages/types`: shared TypeScript contracts
- `packages/utils`: utility functions and helpers

## Root support files

- `package.json`: root commands and dev dependencies
- `pnpm-workspace.yaml`: workspace boundaries for `apps/*`, `packages/*`, and `packages/config/*`
- `turbo.json`: task orchestration
- `tsconfig.json`: base TypeScript config
- `infra/`: local setup, cleanup, and dev-server helper scripts
- `.github/`: CI, review routing, label automation, and deployment scaffolding
- `.agents/`: agent-facing project memory and working notes

## Current boundaries

- No backend app exists yet
- No database runtime is currently part of this workspace

## Future expansion

Likely future additions:

- `apps/api`
- environment-specific runtime documentation
