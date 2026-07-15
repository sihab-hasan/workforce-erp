# Workflow Notes

## Working assumptions

- Treat this repo as frontend-first until an API app is added.
- Prefer updating shared packages when logic should be reused across apps.
- Keep Windows compatibility in mind when adding commands or automation.

## Tooling notes

- Root workspace commands are driven through `pnpm` and `turbo`.
- App development uses Vite-based scripts inside each app package.

## Current verified ports

- `5173`: web
- `5174`: portal
- `5175`: admin

## Good first checks after changes

1. `pnpm format:check`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm build`

## Current non-goals

- No live deployment pipeline yet
- GitHub deploy flow exists only as a verification and handoff scaffold
- No backend runtime in this repo yet
