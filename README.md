# workforce-erp

Frontend-first ERP monorepo built with `pnpm`, Turborepo, Vite, React 19, and TypeScript.

This repository is public for visibility, but it is not open source and remains `UNLICENSED`.

## Current workspace

- `apps/web`: public-facing web app on port `5173`
- `apps/client`: client portal on port `5174`
- `apps/admin`: admin app on port `5175`
- `packages/ui`: shared UI components and styles
- `packages/config/*`: shared ESLint and TypeScript configuration packages
- `packages/constants`: shared constants
- `packages/api-client`: shared API client placeholder
- `packages/types`: shared TypeScript contracts
- `packages/utils`: shared utilities

## Commands

- `pnpm dev`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm format`
- `pnpm format:check`
- `pnpm setup`
- `pnpm clean`
- `pnpm stop`

## Quick contribution flow

1. Fork the repository
2. Clone your fork
3. Add `git@github.com:sihab-hasan/workforce-erp.git` as `upstream`
4. Sync from `develop`
5. Create a feature or fix branch
6. Make your change
7. Run `pnpm format`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm build`
8. Review with `git status` and `git diff`
9. Commit and push your branch
10. Open a pull request to the main repository's `develop` branch

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full fork-to-merge workflow.

## Pull request checks

- GitHub CI runs `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
- Pull requests are auto-labeled from changed files, including app folders, `packages/`, docs, infra, and GitHub workflow changes.

## Notes

- There is no backend app in this workspace yet.
- The workspace globs live in [pnpm-workspace.yaml](./pnpm-workspace.yaml).
- Longer-lived project documentation lives in [`docs/`](./docs/README.md).
- Contribution workflow and pull request expectations live in [`CONTRIBUTING.md`](./CONTRIBUTING.md).
- Repository automation and workflow notes live in [`.github/README.md`](./.github/README.md).
- Local environment helper scripts and infra notes live in [`infra/README.md`](./infra/README.md).
- License and usage terms live in [`LICENSE`](./LICENSE).
- Agent-oriented working notes live in [`.agents/`](./.agents/README.md).
