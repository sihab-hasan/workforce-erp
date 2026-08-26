# @workforce-erp/ui-patterns

Reusable, application-level UI composition patterns for Workforce ERP.

`@workforce-erp/ui-patterns` sits **above** `@workforce-erp/ui`: the UI package owns the design-system primitives, while this package composes those primitives into repeatable ERP experiences such as list reports, master-detail screens, entity/object pages, forms, approvals, dashboards, activity feeds, search, selectors, reporting, and feedback states.

## Architecture

```text
apps/*
  └─ domain workflows, routing, permissions, data fetching, mutations
       ↓
@workforce-erp/ui-patterns
  └─ application-level composition and interaction patterns
       ↓
@workforce-erp/ui
  └─ shadcn/Base UI primitives, tokens, utilities and styling
```

### Package boundaries

- Keep business/domain logic in the apps, not in this package.
- Keep low-level primitives in `@workforce-erp/ui`.
- Keep patterns controlled or controllable so apps own data and mutation state.
- Accept actions, icons, renderable content, and callbacks rather than importing app-specific dependencies.
- Treat UI visibility as presentation only; authorization must still be enforced by the application/server.
- Prefer semantic HTML and the accessibility behavior already supplied by `@workforce-erp/ui` primitives.

## Pattern catalog

| Area        | Patterns                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------- |
| Activity    | activity feed/item, comments, change history                                              |
| Attachments | uploader, list, preview                                                                   |
| Dashboard   | dashboard grid, KPI card, metric card, chart card, widget frame                           |
| Data        | data table, loading/empty states, toolbar, pagination, column visibility, selection hooks |
| Entity      | entity header, summary, metadata, status, actions, tabs                                   |
| Feedback    | empty, error, access denied, confirmation, loading                                        |
| Filters     | filter bar, active filters, filter sheet, saved views, state hooks                        |
| Forms       | form grid, field group, sections, sticky actions, validation summary, dirty-state guard   |
| Layout      | page container, content section, sidebar layout, master-detail, resizable split view      |
| Navigation  | page header/actions/tabs, section navigation                                              |
| Overlays    | action dialog, detail drawer, quick view                                                  |
| Reporting   | report header, filters, viewer, export actions                                            |
| Search      | global search field, search dialog, search results                                        |
| Selectors   | entity picker, multi-entity picker, hierarchical picker                                   |
| Workflow    | workflow status, approval actions, approval route, workflow timeline                      |

## Imports

Import a focused surface when possible:

```tsx
import { DataTable, DataTableToolbar } from "@workforce-erp/ui-patterns/data-table";
import { useDataTable, useSelection } from "@workforce-erp/ui-patterns/hooks";
import { PageHeader } from "@workforce-erp/ui-patterns/navigation";
import { EntityStatus } from "@workforce-erp/ui-patterns/entity";
```

The root export is also available for cases where a single entry point is preferable:

```tsx
import { PageContainer, FormSection, FormActions } from "@workforce-erp/ui-patterns";
```

## Data-table philosophy

The table layer intentionally stays dependency-light. It provides reusable ERP behavior for:

- typed columns and cell renderers
- client-side search, sort, pagination, and column visibility hooks
- controlled row selection and bulk-action composition
- compact/comfortable density
- loading and empty states
- sticky headers and row actions

For server-side or highly specialized grids, keep the pattern shell and own the data engine in the consuming app. This avoids coupling every app to one grid implementation.

## Accessibility and interaction

Patterns are composed from the accessible primitives in `@workforce-erp/ui`, but accessibility still has to be verified in the context of each final screen. In particular, test:

- keyboard-only navigation and visible focus
- accessible names for icon-only actions
- validation/error association with fields
- dialog/drawer focus behavior
- table headings and selection semantics
- zoom/reflow and responsive layouts
- loading, empty, error, permission, and destructive-action states

## Styling

Patterns use the same Tailwind/design tokens as `@workforce-erp/ui`; they do not introduce a competing visual system. `src/styles/ui-patterns.css` is reserved for package-level pattern CSS when utility classes are not sufficient.

## Verification

From the workspace root:

```bash
pnpm nx typecheck @workforce-erp/ui
pnpm nx typecheck @workforce-erp/ui-patterns
pnpm nx lint @workforce-erp/ui-patterns
```
