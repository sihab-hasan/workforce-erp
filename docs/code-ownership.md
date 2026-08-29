# Code Ownership & Workspace Boundaries

Workforce ERP is structured as an **Nx + pnpm monorepo** with strict architectural boundaries between applications, shared packages, background services, and backend systems.

```text
workforce-erp/
├── apps/
│   ├── web/               # Public website & marketing SPA (React + Vite)
│   ├── erp/               # Multi-tenant Workforce ERP SPA (React + Vite)
│   ├── admin/             # Platform Administration SPA (React + Vite)
│   └── api/               # Canonical Laravel 13 API backend (PHP 8.3+)
├── services/
│   └── worker/            # Background worker service (Node.js)
├── packages/
│   ├── api-client/        # Shared fetch-based HTTP transport & error models
│   ├── auth/              # Shared React authentication providers, session, & guards
│   ├── authorization/     # Shared RBAC capability gates, scope guards, & permission helpers
│   ├── contracts/         # Stable cross-boundary TypeScript contracts & interfaces
│   ├── tenancy/           # Shared tenant/company context, hooks, & header injection
│   ├── ui/                # Shared design system, Tailwind v4 styles, & UI primitives
│   └── utils/             # Framework-agnostic pure helper functions
├── tooling/
│   ├── eslint-config/     # Unified ESLint flat configurations
│   ├── prettier-config/   # Unified Prettier formatting rules
│   └── typescript-config/ # Shared TypeScript compiler presets
├── infra/                 # Docker Compose, Nginx gateway, TLS, and deployment configs
└── docs/                  # Architectural guides, runbooks, and security specifications
```

---

## Application Boundaries (`apps/*`)

Applications own user interfaces, routing, feature-level integration, and layout composition. They consume shared packages via `workspace:*` dependencies.

- **`apps/erp`**: The primary customer application. Owns workforce management features (Employees, Timesheets, Leave, Departments, Documents, Approvals, Profile, Company Settings). Authenticates via Sanctum cookies and requires active tenant context.
- **`apps/web`**: Public-facing marketing website and initial registration entry point.
- **`apps/admin`**: Platform administration interface. Uses platform-level credentials and platform authorization (`/api/v1/platform/*`).
- **`apps/api`**: Authoritative backend API built on Laravel 13. Enforces authentication, validation, multi-tenant isolation, role and permission evaluations, data scopes, database transactions, and audit logging.

### App Internal Directory Conventions

Inside each React application (`apps/*/src`):

- `app/providers.tsx`: Composes shared root providers (`AuthProvider`, `TenancyProvider`, `AuthorizationProvider`, `QueryClientProvider`, `ThemeProvider`).
- `access/`: App-specific role definitions, capability matrices, and scope resolvers.
- `config/`: App-specific environment configurations and navigation manifests.
- `routes/`: React Router definitions, route constants, and canonical paths.
- `layouts/`: Application layout shells (e.g. `AppLayout`, `CompanyLayout`, `AuthLayout`).
- `features/`: Isolated product feature modules containing components, hooks, API callers, and queries.

---

## Shared Package Boundaries (`packages/*`)

Packages must remain focused, modular, and decoupled from application business logic:

| Package                            | Responsibility                                                                                                                | Forbidden In This Package                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **`@workforce-erp/api-client`**    | Generic HTTP client, cookie/Sanctum transport, header injection (`X-Tenant-Key`, `X-Company-Key`), normalized `ApiError`.     | App-specific business endpoints or page logic.                         |
| **`@workforce-erp/auth`**          | React `AuthProvider`, `useAuth`, `useSession`, `RequireAuth`, `AuthGuard`. Stores non-sensitive session view in React memory. | Storing auth tokens in `localStorage` or backend authentication logic. |
| **`@workforce-erp/authorization`** | Declarative `CapabilityGate`, `CapabilityGuard`, `ScopeGuard`, `useAuthorization`.                                            | Hardcoded app feature routes or backend DB queries.                    |
| **`@workforce-erp/contracts`**     | Shared TypeScript types, API contracts, domain entities, and event payloads.                                                  | Runtime side-effects, React dependencies, or network calls.            |
| **`@workforce-erp/tenancy`**       | `TenancyProvider`, `useTenancy`, tenant switching context, and header builder helpers.                                        | Direct API mutation logic.                                             |
| **`@workforce-erp/ui`**            | Reusable UI components (buttons, dialogs, cards, forms, tables), Tailwind v4 setup, motion utilities.                         | Direct backend API calls or tenant state.                              |
| **`@workforce-erp/utils`**         | Pure utilities (strings, arrays, assertions, async helpers).                                                                  | Framework-specific state or business logic.                            |

---

## Background Services (`services/*`)

- **`services/worker`**: Standalone Node.js background process for asynchronous notifications, report generation, and queue polling. Communicates strictly with the backend via machine service accounts (`POST /api/v1/auth/service-token`).

---

## Tooling & Infrastructure (`tooling/*`, `infra/*`)

- **`tooling/*`**: Central configuration packages for ESLint flat config, Prettier formatting, and TypeScript tsconfig inheritance. Keeps compiler and linter rules identical across all workspaces.
- **`infra/*`**: Infrastructure as Code (Docker Compose multi-container stack, Nginx reverse proxy gateway, PHP-FPM container, MySQL, Redis, and Certbot automation).
