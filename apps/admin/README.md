# Platform Administration Application (`apps/admin`)

The central administration single-page application (SPA) for Workforce ERP operators, support engineers, and security officers. Built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui** design system components.

---

## Capabilities & Modules

- **Platform Dashboard**: Platform-wide metrics, tenant counts, active user load, and system health status.
- **Tenant & Organization Management**: Tenant discovery, organization details, status inspection, and subscription tier assignments.
- **Platform Users & Roles**: Platform operator role assignments (`platform_super_admin`, `platform_security_admin`, `platform_support`, `platform_auditor`).
- **Platform Security & Audit**: Cross-tenant append-only security logs, access tracking, and anomaly inspection.
- **Support Impersonation & Break-Glass**: Time-bounded, audited support access with restricted mutation permissions.

---

## Authorization Model

Platform administration is strictly decoupled from customer tenant organizations. The Admin application interacts exclusively with the `/api/v1/platform/*` API namespace:

| Role                      | Permissions                                                                     |
| ------------------------- | ------------------------------------------------------------------------------- |
| `platform_super_admin`    | Full platform management, break-glass initiation, support impersonation, audit. |
| `platform_security_admin` | Audit log review, break-glass review, platform session revocation.              |
| `platform_support`        | Tenant search, diagnostic details, time-limited impersonation sessions.         |
| `platform_auditor`        | Read-only compliance audit access across platform events.                       |

---

## Local Development

From the monorepo root:

```bash
# Start Admin app only:
pnpm dev:admin

# Or start all frontend apps together:
pnpm dev
```

The Admin application will be available at **`http://localhost:5175`**.

### Quality & Build Commands

```bash
# Typecheck
pnpm nx run @workforce-erp/admin:typecheck

# Lint
pnpm nx run @workforce-erp/admin:lint

# Production build
pnpm nx run @workforce-erp/admin:build

# Preview production build
pnpm nx run @workforce-erp/admin:preview
```

---

## Architecture & Structure

```text
apps/admin/src/
├── app/          # Root providers (AdminAuthProvider, QueryClient, ThemeProvider)
├── access/       # Platform-specific roles, permissions, and guard helpers
├── components/   # Shared admin UI components and widgets
├── config/       # Admin navigation items and runtime config
├── features/     # Platform feature modules (organizations, users, roles, audit)
├── layouts/      # Admin layout shells (AdminLayout, AuthLayout)
├── pages/        # Route page views
└── routes/       # React Router setup
```

---

## Environment Configuration

Environment variables are inherited from the root `.env`:

| Variable                | Default (Local)         | Purpose                                    |
| ----------------------- | ----------------------- | ------------------------------------------ |
| `ADMIN_DEV_PORT`        | `5175`                  | Local Vite dev server port                 |
| `ADMIN_PREVIEW_PORT`    | `4175`                  | Local Vite preview port                    |
| `VITE_API_PROXY_TARGET` | `http://127.0.0.1:8000` | Backend API target for Vite proxy          |
| `VITE_API_URL`          | `/api`                  | Base path for API client calls             |
| `VITE_ERP_URL`          | `http://localhost:5174` | Cross-app URL for ERP customer application |
| `VITE_WEB_URL`          | `http://localhost:5173` | Cross-app URL for public marketing website |
