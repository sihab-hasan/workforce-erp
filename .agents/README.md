# Workforce ERP Agent System

Repository-local operating guidance for AI-assisted software engineering in the Workforce ERP
monorepo.

## Current repository state as of 2026-07-16

- Checked-in frontend apps: `apps/web`, `apps/portal`, and `apps/admin`
- Canonical backend lane: `apps/api` for the Laravel API
- Shared packages: `api-client`, `auth-client`, `permissions`, `types`, `ui`, `utils`,
  `constants`, and `config/*`
- Active CI validation: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm build`
- MCP workspace configuration lives in `.vscode/mcp.json`

## Directory map

- `agents/` — specialist agent charters
- `rules/` — mandatory engineering standards
- `context/` — repository-specific architecture and operating context
- `workflows/` — end-to-end task procedures
- `playbooks/` — situation-specific technical guidance
- `checklists/` — completion and review gates
- `templates/` — reusable planning and documentation templates
- `governance/` — ownership, risk, and change-control guidance
- `scoped/` — app/package-specific `AGENTS.md` files to copy into the repository
- `memory/` — durable decision and issue records
- `mcp/` — MCP configuration, permissions, security, inventory, and operating governance
- `examples/` — sample plans and deliverables

## Operating rule

Any architectural, security, API, release, testing, or ownership change that invalidates these
instructions must update this directory in the same pull request.

When backend code is added under `apps/api`, update the related `.agents` commands, workflows,
scoped instructions, and MCP notes in the same change so the kit stays truthful.
