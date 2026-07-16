# Workflow Notes

## Why this file exists

This document captures the practical engineering flow for contributors working in the repository.
It is intentionally shorter and more human-facing than the detailed `.agents/workflows/*` files.

## Standard working flow

1. Read the root `README.md` for the current repo commands and contribution expectations.
2. Check `docs/architecture.md` and `docs/conventions.md` before making structural changes.
3. Identify the owning app or package before adding code.
4. Reuse `packages/ui`, `packages/api-client`, `packages/types`, and `packages/permissions` where
   appropriate instead of duplicating boundaries in apps.
5. Keep frontend and backend contract assumptions aligned with the canonical `apps/api` lane.
6. Run the standard validation gate before considering a change complete.

## App and package ownership flow

- Put public-site behavior in `apps/web`
- Put tenant-facing operational workflows in `apps/portal`
- Put privileged internal workflows in `apps/admin`
- Put shared domain-neutral UI in `packages/ui`
- Put transport logic and endpoint contracts in `packages/api-client`
- Put shared auth state and guards in `packages/auth-client`
- Put shared permission vocabulary in `packages/permissions`

## Design and implementation notes

- Follow existing portal module structure for non-trivial frontend features:
  `src/app`, `src/modules`, `src/shared`, and `src/shell`
- Promote code to `packages/` only when reuse is proven, not guessed
- Keep business logic out of view-layer React components
- Keep security-sensitive decisions out of client-only permission checks

## Validation notes

The baseline repository validation flow is:

1. `pnpm format:check`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm build`

If workspace tests, integration tests, or backend tests are not available for the changed area,
state that explicitly instead of implying they ran.

## Documentation notes

- Root `README.md`: quick start and repository commands
- `docs/`: human-facing project and engineering reference
- `.agents/`: agent-facing operating system, policies, workflows, and memory
- `.github/`: CI, templates, CODEOWNERS, and automation

## Decision notes

Major architectural or contract decisions should be captured as ADRs under
`../.agents/memory/decisions/` and indexed in `../.agents/context/decision-log.md`.
