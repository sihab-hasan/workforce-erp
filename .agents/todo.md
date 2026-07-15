# Todo

## Near-term

- Add real UI/content to the placeholder pages in `apps/web`, `apps/client`, and `apps/admin`
- Decide the first shared business modules to move into `packages/`
- Add consistent navigation/layout structure across all frontend apps
- Review whether `packages/api-client` needs a stronger contract before the API app is added

## Later

- Add `apps/api` when backend scope is ready
- Introduce authentication/auth package when app flows require it
- Add environment variable documentation per app
- Add deployment automation after hosting target is finalized

## Verification habit

After meaningful repo changes, run:

1. `pnpm format`
2. `pnpm format:check`
3. `pnpm lint`
4. `pnpm typecheck`
5. `pnpm build`
