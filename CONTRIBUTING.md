# Contributing

Thanks for contributing to Workforce ERP.

This repository is public for visibility, but it is not open source and remains `UNLICENSED`. Contributions should happen through approved collaboration with the project team.

## Before you start

- Use `Node.js` `20` or newer.
- Use `pnpm` as the package manager.
- Run commands from the repository root unless there is a clear reason to work inside a specific app or package.
- Read `README.md` for the quick project overview.
- Read `docs/conventions.md` before making shared or repo-wide changes.

## Project structure

- `apps/web`: public-facing web app on port `5173`
- `apps/portal`: tenant portal on port `5174`
- `apps/admin`: admin app on port `5175`
- `packages/ui`: shared UI components and styles
- `packages/constants`: shared constants
- `packages/types`: shared TypeScript contracts
- `packages/utils`: shared utilities
- `packages/api-client`: shared API client placeholder
- `packages/config/*`: shared ESLint and TypeScript config
- `docs/`: longer-lived project documentation
- `infra/`: local helper scripts and infra-related files
- `.github/`: CI, templates, labels, and repo automation

## Setup

1. Clone your working copy.
2. Install dependencies:

```bash
pnpm install
```

3. If needed, run the workspace setup helper:

```bash
pnpm setup
```

4. Start local development:

```bash
pnpm dev
```

This repository uses Turborepo, so root commands run across the workspace.

## Common commands

- `pnpm dev`: run local development
- `pnpm lint`: run linting across the workspace
- `pnpm typecheck`: run TypeScript checks
- `pnpm build`: build all apps and packages
- `pnpm format`: format the repository with Prettier
- `pnpm format:check`: verify formatting without writing changes
- `pnpm setup`: run the workspace setup helper
- `pnpm clean`: remove workspace build artifacts and local install output
- `pnpm stop`: stop local dev servers on the repo ports

## Full contribution flow

This is the normal contribution flow from fork to merge.

### 1. Fork the repository

Fork the repository to your own GitHub account.

### 2. Clone your fork

```bash
git clone git@github.com:<your-github-username>/workforce-erp.git
cd workforce-erp
```

### 3. Add the original repository as upstream

```bash
git remote add upstream git@github.com:sihab-hasan/workforce-erp.git
git remote -v
```

This lets you keep your fork updated with the main repository.

### 4. Sync your fork before starting work

```bash
git fetch upstream
git checkout develop
git merge upstream/develop
git push origin develop
```

The default branch for this repository is `develop`.

### 5. Create a new branch

Create a focused branch for your work:

```bash
git checkout -b feature/short-description
```

Examples:

- `feature/portal-invoice-summary`
- `fix/admin-auth-redirect`
- `docs/update-contributing-guide`

### 6. Make your changes

- Keep the change focused.
- Put app-specific code inside the correct app.
- Move code to `packages/` only when reuse is real and needed.
- Avoid mixing unrelated cleanup with feature work.

### 7. Run checks locally

Before staging or opening a PR, run:

```bash
pnpm format
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
```

If the change affects UI behavior, also verify the affected app locally:

```bash
pnpm dev
```

### 8. Review what changed

Check your work before committing:

```bash
git status
git diff
```

Make sure you did not include unrelated files.

### 9. Stage your changes

```bash
git add .
```

If needed, stage specific files instead of everything.

### 10. Commit your changes

```bash
git commit -m "short summary of your change"
```

Use a short, clear commit message that explains the change.

Examples:

- `git commit -m "Fix admin login redirect"`
- `git commit -m "Update contributing guide"`
- `git commit -m "Add invoice summary card to portal dashboard"`

### 11. Push your branch

```bash
git push origin feature/short-description
```

### 12. Open a pull request

Open a pull request from your fork branch to the main repository.

Your PR should include:

- a short summary of the change
- the user or system impact
- the checks you ran
- screenshots or recordings for UI changes when relevant
- notes about documentation, tests, environment variables, migrations, or deployment impact when relevant

Use the PR template in `.github/PULL_REQUEST_TEMPLATE.md`.

### 13. Wait for CI checks

GitHub CI currently runs:

- `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

Pull requests are also auto-labeled based on changed files in `apps/*`, `packages/*`, `docs`, `infra`, GitHub workflow files, and dependency manifests.

Do not consider the PR ready to merge until the required checks pass.

### 14. Address review comments or failed checks

If reviewers request changes or CI fails:

1. update your branch locally
2. fix the issue
3. rerun the relevant checks
4. commit the update
5. push again to the same branch

The pull request will update automatically.

### 15. Maintainer merge

After review approval and after all required checks pass, a repository owner or approved maintainer will merge the pull request.

Contributors should not merge based only on opening the PR. Final merge depends on:

- review approval
- successful CI
- maintainer decision

## Contribution guidelines

- Keep shared logic in `packages/` only when more than one app uses it.
- Keep app-specific UI and flows inside the relevant app until reuse is proven.
- Prefer root or `docs/` documentation for shared rules instead of duplicating the same guidance across apps.
- Keep port references aligned with each app's package scripts.
- Follow the existing Vite, React, TypeScript, and Turborepo patterns already used in the repo.

## Validation checklist

Before asking for review, confirm that:

- formatting is correct
- linting passes
- typechecking passes
- builds pass
- docs are updated if needed
- screenshots are attached for UI work when relevant
- no unrelated files were changed by accident

## Documentation guidelines

- Keep quick-start and day-to-day commands in `README.md`.
- Keep longer-lived project material in `docs/`.
- Keep repository automation notes in `.github/`.
- Update `CONTRIBUTING.md` when the contribution process changes.

## Questions

If something is unclear, align with the project owners listed in `.github/CODEOWNERS` before making broad structural or workflow changes.
