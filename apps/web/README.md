# Public Web Application (`apps/web`)

The public-facing marketing and onboarding website for Workforce ERP. Built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, and **GSAP/Motion** animations.

---

## Capabilities & Pages

- **Home / Landing**: Hero showcase, value propositions, feature highlights, and interactive product previews.
- **Features Showcase**: Detailed module breakdowns (Attendance, HR, Leaves, Documents, Security, and Compliance).
- **Company & Contact**: About the product, leadership, inquiries, and customer contact forms.
- **Registration Flow**: Initial registration entry point directing new customers to tenant onboarding.
- **Cross-App Navigation**: Seamless navigation links to ERP Portal (`apps/erp`) and Admin (`apps/admin`).

---

## Local Development

From the monorepo root:

```bash
# Start Web app only:
pnpm dev:web

# Or start all frontend apps together:
pnpm dev
```

The Web application will be available at **`http://localhost:5173`**.

### Quality & Build Commands

```bash
# Typecheck
pnpm nx run @workforce-erp/web:typecheck

# Lint
pnpm nx run @workforce-erp/web:lint

# Production build
pnpm nx run @workforce-erp/web:build

# Preview production build
pnpm nx run @workforce-erp/web:preview
```

---

## Architecture & Structure

```text
apps/web/src/
├── app/          # Root providers (QueryClient, ThemeProvider, etc.)
├── components/   # Shared marketing components (navigation bar, footer, CTA banners)
├── config/       # Marketing navigation, feature lists, pricing definitions
├── features/     # Feature sections (home, features, company, contact, authentication)
├── layouts/      # Marketing and public layout shells
├── pages/        # Top-level route pages
└── routes/       # React Router setup
```

---

## Environment Configuration

Environment variables are inherited from the root `.env`:

| Variable                | Default (Local)         | Purpose                                    |
| ----------------------- | ----------------------- | ------------------------------------------ |
| `WEB_DEV_PORT`          | `5173`                  | Local Vite dev server port                 |
| `WEB_PREVIEW_PORT`      | `4173`                  | Local Vite preview port                    |
| `VITE_API_PROXY_TARGET` | `http://127.0.0.1:8000` | Backend API target for Vite proxy          |
| `VITE_ERP_URL`          | `http://localhost:5174` | Cross-app URL for ERP customer application |
| `VITE_ADMIN_URL`        | `http://localhost:5175` | Cross-app URL for platform administration  |
