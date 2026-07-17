# Architecture

## Current shape

The repository is a full-stack `pnpm` monorepo using Turborepo.
The checked-in runtime currently contains three Vite + React applications, a set of shared internal
packages, and a canonical backend lane at `apps/api`.

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

- The checked-in working tree currently contains frontend applications and shared packages
- `apps/api` is the canonical Laravel API location, even though the backend working tree is not
  present yet

## Future expansion

Likely future additions:

- environment-specific runtime documentation
