# Project Overview

## Summary

`workforce-erp` is a `pnpm` monorepo powered by Turborepo.
The current workspace focuses on frontend foundations with three Vite + React apps and shared internal packages.

## Applications

- `apps/web`: public app on port `5173`
- `apps/portal`: tenant portal on port `5174`
- `apps/admin`: admin app on port `5175`

## Shared packages

- `packages/ui`: reusable UI components and styles
- `packages/config/*`: shared ESLint and TypeScript config packages
- `packages/constants`: shared constants
- `packages/api-client`: frontend API client layer placeholder
- `packages/types`: shared TypeScript contracts
- `packages/utils`: utility helpers

## Root tooling

- Package manager: `pnpm`
- Task runner: `turbo`
- Language: `TypeScript`
- App tooling: `Vite 8`
- UI runtime: `React 19`

## Important notes

- There is no backend or database app in the repo yet.
- The repo currently contains scaffold-level app pages.
- Root commands are `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm format`, and `pnpm format:check`.
- GitHub Actions exist for CI validation and a deploy scaffold, but there is no live deployment pipeline yet.
