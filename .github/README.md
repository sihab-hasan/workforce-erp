# GitHub configuration

This folder contains repository automation, CI, review hygiene, and deployment scaffolding for Workforce ERP.

Project overview, workspace details, and shared commands are documented in the [root README](../README.md).

## Structure

- `workflows/ci.yml`: format, lint, typecheck, and build validation for the current workspace
- `workflows/labeler.yml`: runs pull request labeling
- `labeler.yml`: label rules based on changed files
- `workflows/deploy.yml`: separate-check deployment scaffold with manual handoff for the current apps
- `actions/setup-node-pnpm/action.yml`: shared setup for Node and pnpm
- `CODEOWNERS`: review routing for the project owners
- `PULL_REQUEST_TEMPLATE.md`: pull request hygiene checklist
- `ISSUE_TEMPLATE/`: issue intake templates

## Notes

- `CODEOWNERS` assigns project-wide ownership to `@sihab-hasan`, `@abidhasan176`, `@mashru04`, and `@Monjur-A-Maula`.
- `@sihab-hasan` is the repo owner and team lead.
- The repository is public for visibility, but it is not open source and remains `UNLICENSED`.
- The default integration branch is `develop`.
- `workflows/ci.yml` no longer references an API test job because `apps/api` is not in this workspace yet.
- The active app folders in this workspace are `apps/web`, `apps/client`, and `apps/admin`.
- `.github/labeler.yml` maps changed files to PR labels for `apps/*`, `packages/*`, `docs`, `infra`, `ci`, and dependency manifest changes.
- `workflows/deploy.yml` is a scaffold, not a live deployment pipeline.
- CI and deployment verification run the standard checks: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm build`.

## Deployment status

Production deployment is not finalized yet. Hosting targets, provider-specific workflow steps, and required secrets still need to be completed in [`workflows/deploy.yml`](./workflows/deploy.yml).
