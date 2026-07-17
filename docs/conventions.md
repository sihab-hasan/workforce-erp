# Conventions

## Repo conventions

- Keep shared logic in `packages/` when multiple apps use it.
- Keep app-specific UI or flows inside each app until reuse is proven.
- Keep reusable shadcn/ui components in shared packages when they are intended to be consumed by more than one app.
- Prefer root-level documentation for shared rules rather than duplicating notes across apps.

## Command conventions

- Use `pnpm` for workspace commands.
- Use root workspace commands such as `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm format`, and `pnpm format:check`.
- Use `pnpm setup`, `pnpm clean`, and `pnpm stop` for local environment helpers instead of ad hoc scripts.

## App conventions

- App packages use Vite for local development and builds.
- Keep port references aligned with the app package scripts.

## UI conventions

- Use `packages/ui` as the shared home for package-level shadcn/ui components and styling primitives.
- Keep the shadcn registry config aligned with `packages/ui/components.json`.
- Prefer shared aliases such as `@workforce-erp/ui/components` and `@workforce-erp/ui/lib/utils` when wiring shadcn components into apps.

## Validation conventions

Use the separate validation flow:

1. `pnpm format:check`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm build`

## Documentation conventions

- Keep quick-start information in the root `README.md`.
- Keep longer-lived project docs in `docs/`.
- Keep agent-oriented working context in `.agents/`.
