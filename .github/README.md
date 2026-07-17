# GitHub configuration

This folder contains repository automation, CI, review hygiene, and deployment scaffolding for Workforce ERP.

Project overview, workspace details, and shared commands are documented in the [root README](../README.md).

## Structure

- `workflows/ci.yml`: pull request, push, and manual entry point for all validation
- `workflows/frontend.yml`: reusable frontend format, lint, typecheck, and build validation
- `workflows/api.yml`: reusable Laravel API format and test validation
- `workflows/labeler.yml`: runs pull request labeling
- `labeler.yml`: label rules based on changed files
- `workflows/deploy.yml`: separate-check deployment scaffold with manual handoff for the current apps
- `actions/setup-node-pnpm/action.yml`: shared setup for Node.js and pnpm
- `actions/setup-php-composer/action.yml`: shared setup for PHP and Composer
- `CODEOWNERS`: review routing for the project owners
- `PULL_REQUEST_TEMPLATE.md`: pull request hygiene checklist
- `ISSUE_TEMPLATE/`: issue intake templates
- `SECURITY.md`: private security reporting guidance
- `SUPPORT.md`: contributor and issue support guidance

## Notes

- `CODEOWNERS` assigns project-wide ownership to `@sihab-hasan`, `@abidhasan176`, `@mashru04`, and `@Monjur-A-Maula`.
- `@sihab-hasan` is the repo owner and team lead.
- The repository is public for visibility, but it is not open source and remains `UNLICENSED`.
- The default integration branch is `develop`.
- The repository currently follows a PR-based workflow centered on `develop`, with CI checks and branch protection expected there.
- `workflows/ci.yml` delegates validation to the frontend and API reusable workflows.
- The active app folders are `apps/web`, `apps/portal`, `apps/admin`, and `apps/api`.
- `.github/labeler.yml` maps changed files to PR labels for `apps/*`, `packages/*`, `docs`, `infra`, `ci`, and dependency manifest changes.
- `workflows/deploy.yml` is a scaffold, not a live deployment pipeline.
- Frontend validation checks formatting, linting, type safety, and builds for the three React applications and their workspace dependencies.
- API validation checks Laravel formatting and runs the API test suite.

## Deployment status

Production deployment is not finalized yet. Hosting targets, provider-specific workflow steps, and required secrets still need to be completed in [`workflows/deploy.yml`](./workflows/deploy.yml).
