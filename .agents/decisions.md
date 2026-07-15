# Decisions

## Current decisions

- The repo is currently frontend-first; no `apps/api` exists yet.
- Agent/context files live at the repo root inside `.agents` instead of being duplicated in each app.
- Root `package.json` keeps the currently needed workspace commands: `dev`, `build`, `lint`, `typecheck`, `format`, `format:check`, `setup`, `clean`, and `stop`.
- Live deployment scripts and database backup/restore scripts are intentionally absent because the repo has no backend/database/runtime target yet.
- GitHub deployment is represented only by a verification and handoff scaffold, not by provider-specific release automation.
- Local app ports are fixed as:
  - `5173` for `apps/web`
  - `5174` for `apps/client`
  - `5175` for `apps/admin`

## Revisit later

- Whether app-specific agent config is needed inside `apps/*`
- Whether `packages/api-client` should stay as a placeholder or become a full shared client layer before `apps/api` exists
- Whether deploy automation should live as scripts, CI workflows, or both
