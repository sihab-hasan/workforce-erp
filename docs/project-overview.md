# Project Overview

## Purpose

Workforce ERP is a full-stack ERP monorepo designed to serve multiple product surfaces from one
shared engineering system. The repository is organized so frontend applications, shared packages,
and the canonical backend lane can evolve together without losing contract discipline.

## Product surfaces

- `apps/web`: public-facing web surface
- `apps/portal`: authenticated tenant and operations portal
- `apps/admin`: privileged internal administration surface
- `apps/api`: canonical Laravel API location for backend services and protected business operations

## Current repository state on July 16, 2026

The checked-in runtime currently includes the three frontend applications plus shared packages.
`apps/api` is the canonical backend lane and the repository contract already assumes it, even though
the backend working tree is not present yet.

## Shared packages

- `packages/ui`: shared design-system components, styles, and shadcn/ui foundation
- `packages/api-client`: shared transport boundary and OpenAPI/codegen lane
- `packages/auth-client`: shared auth state, guards, hooks, and token/session helpers
- `packages/permissions`: shared permission vocabulary and client-side UX guards
- `packages/types`: stable shared TypeScript contracts
- `packages/constants`: stable cross-app constants
- `packages/utils`: framework-independent helpers
- `packages/config/*`: shared TypeScript and ESLint configuration

## Engineering model

- Monorepo tooling: `pnpm` + Turborepo
- Frontend stack: React, TypeScript, Vite, Tailwind CSS
- Backend contract: Laravel, PHP, JSON REST API
- Shared API boundary: frontend applications should consume remote APIs through
  `packages/api-client`
- Shared UI boundary: reusable, domain-neutral components belong in `packages/ui`

## Delivery expectations

- Keep app-specific workflows inside the owning app until reuse is real.
- Keep API, frontend consumers, shared types, and documentation synchronized.
- Treat authorization as a server-side concern, with client permission checks used only for UX.
- Prefer small, reversible, well-scoped changes over broad speculative abstraction.

## Standard validation gate

The current repository-wide validation gate is:

1. `pnpm format:check`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm build`

Area-specific tests should be added and reported explicitly where they exist.

## Security posture

- Sensitive data is private by default.
- Production write access is denied by default through the documented MCP policy.
- Auth, permissions, token handling, exports, and administrative workflows require heightened care.
- Shared auth token persistence remains a security-sensitive area until the production auth model is
  fully hardened.

## Related documents

- [architecture.md](./architecture.md)
- [conventions.md](./conventions.md)
- [workflow-notes.md](./workflow-notes.md)
- [roadmap.md](./roadmap.md)
- [../.agents/context/decision-log.md](../.agents/context/decision-log.md)
