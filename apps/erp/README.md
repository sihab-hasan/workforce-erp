# Workforce ERP Application (`apps/erp`)

The primary multi-tenant customer single-page application (SPA) for Workforce ERP. Built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui** design system components.

---

## Capabilities & Modules

- **Authentication & Security**: First-party Sanctum cookie session management, MFA challenges (TOTP, Email, SMS), Google/Microsoft SSO callbacks, password management, and security profile audit views.
- **Tenancy & Multi-Company**: Tenant selection, switching, active company context, and header injection (`X-Tenant-Key`, `X-Company-Key`).
- **Employee Directory**: Comprehensive employee directory, profile inspection, status filters, and company/department associations.
- **Attendance & Timesheets**: Server-authoritative live clock widget, daily status tracking, and manager correction workflows.
- **Leave Management**: Leave balances, request submissions, calendar visualization, and managerial review workflows.
- **Departments & Organization**: Department hierarchy, member assignments, and company organizational structures.
- **Access Control & Roles**: Role management, permission matrices, membership role assignments, and Separation of Duties (SoD) views.
- **Documents & Reports**: Document repositories, compliance attachments, and business KPI reporting dashboards.

---

## Local Development

From the monorepo root:

```bash
# Start ERP app only:
pnpm dev:erp

# Or start all frontend apps and worker together:
pnpm dev
```

The ERP application will be available at **`http://localhost:5174`**.

### Quality & Build Commands

```bash
# Typecheck
pnpm nx run @workforce-erp/erp:typecheck

# Lint
pnpm nx run @workforce-erp/erp:lint

# Production build
pnpm nx run @workforce-erp/erp:build

# Preview production build
pnpm nx run @workforce-erp/erp:preview
```

---

## Architecture & Structure

```text
apps/erp/src/
├── app/          # Root providers (Auth, Tenancy, Authorization, React Query, Theme)
├── access/       # ERP-specific roles, capabilities, and scope helpers
├── components/   # Shared application-level UI components
├── config/       # Runtime config, feature flags, navigation items
├── features/     # Feature-isolated modules (employees, timesheets, leave, etc.)
├── layouts/      # Layout shells (AppLayout, CompanyLayout, AuthLayout, SettingsLayout)
├── lib/          # Utilities, date formatters, and query helpers
├── pages/        # Route entry points and top-level views
└── routes/       # React Router definitions and canonical path builders
```

---

## Environment Configuration

Environment variables are inherited from the root `.env`:

| Variable                | Default (Local)         | Purpose                                                 |
| ----------------------- | ----------------------- | ------------------------------------------------------- |
| `ERP_DEV_PORT`          | `5174`                  | Local Vite dev server port                              |
| `ERP_PREVIEW_PORT`      | `4174`                  | Local Vite preview port                                 |
| `VITE_API_PROXY_TARGET` | `http://127.0.0.1:8000` | Backend API target for Vite `/api` and `/sanctum` proxy |
| `VITE_API_URL`          | `/api`                  | Base path for API client calls                          |
| `VITE_WEB_URL`          | `http://localhost:5173` | Cross-app URL for public marketing website              |
| `VITE_ADMIN_URL`        | `http://localhost:5175` | Cross-app URL for platform administration               |
