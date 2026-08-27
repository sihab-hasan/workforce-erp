# GitHub configuration

This directory contains repository automation, CI, review hygiene, issue intake, dependency maintenance, and production deployment scaffolding for Workforce ERP.

Project setup and shared commands are documented in the [root README](../README.md).

## Branch model

The repository uses two long-lived branches:

- `main` — **GitHub default branch and production/deploy branch**. It must always represent production-ready code.
- `develop` — integration branch for ongoing development. Feature, fix, refactor, and routine dependency PRs target this branch.

Expected flow:

```text
feature/* ─┐
fix/*     ─┼──> develop ── release PR ──> main ──> production
chore/*   ─┘
```

Hotfix flow:

```text
hotfix/* ──> main ──> production
                └────> merge/backport to develop
```

Do not use `develop` as the GitHub default branch. Do not use it as the production deployment source.

## GitHub repository settings

Configure the repository on GitHub so that:

1. **Default branch:** `main`
2. **Production environment:** deployment source is `main`
3. **Normal development PR base:** `develop`
4. **Release PR:** `develop` → `main`
5. Delete merged feature branches when appropriate.

Repository files cannot change GitHub's server-side default-branch setting by themselves; set `main` as the default branch in the repository settings once.

## Branch protection / rulesets

### `main`

Recommended rules:

- Require a pull request before merging.
- Require at least one approval.
- Require CI status checks to pass.
- Require conversations to be resolved.
- Block force pushes and branch deletion.
- Restrict direct pushes except for explicitly approved maintainers/bots if required.
- Use the `production` GitHub Environment for production credentials and approvals.

### `develop`

Recommended rules:

- Require a pull request before merging.
- Require CI status checks to pass.
- Require conversations to be resolved.
- Block force pushes and branch deletion.

## Workspace policy

- Monorepo orchestrator: Nx
- JavaScript package manager: pnpm
- GitHub default branch: `main`
- Integration branch: `develop`
- Production/deploy branch: `main`
- Node runtime in CI: Node.js 22
- Laravel CI runtime: PHP 8.5 + Composer 2

Turborepo is not part of this repository.

## Automation

- `workflows/ci.yml` — validates pushes and pull requests involving `main` or `develop`
- `workflows/frontend.yml` — reusable Node workspace validation using `nx affected`
- `workflows/api.yml` — reusable Laravel API validation
- `workflows/labeler.yml` — file-based pull request labeling
- `workflows/deploy.yml` — production deployment entry point; runs only from `main`
- `actions/setup-node-pnpm/action.yml` — shared Node.js / pnpm setup
- `actions/setup-php-composer/action.yml` — shared PHP / Composer setup

## CI behavior

CI runs for:

- pushes to `develop`
- pushes to `main`
- pull requests targeting `develop`
- pull requests targeting `main`
- manual workflow dispatches

The Node workflow uses full Git history and Nx affected SHAs, then runs repository validation, import-boundary checks, type checking, linting, and builds for affected Node projects.

The API workflow validates Composer metadata, installs Composer dependencies, and runs the Laravel test suite.

## Deployment behavior

`workflows/deploy.yml` treats `main` as the only production source:

- a push to `main` starts the production deployment workflow
- a manual production workflow run is rejected when started from any branch other than `main`
- repository validation must pass before the deployment handoff job
- production secrets belong in the GitHub `production` Environment, never in repository files

The current workflow contains the production gate and validation handoff. Provider-specific deployment commands still need to be added when the hosting target is finalized.
