# Commands

## Development

- Run all dev tasks: `pnpm dev`

## Quality checks

- Format-check workspace files: `pnpm format:check`
- Typecheck workspace: `pnpm typecheck`
- Lint workspace: `pnpm lint`
- Build workspace: `pnpm build`
- Format repo files: `pnpm format`
- Run the same checks GitHub CI relies on: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm build`

## Single-app dev

- Web: `pnpm --filter @workforce-erp/web dev`
- Portal: `pnpm --filter @workforce-erp/portal dev`
- Admin: `pnpm --filter @workforce-erp/admin dev`
