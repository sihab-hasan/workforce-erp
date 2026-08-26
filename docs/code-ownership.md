# Code ownership

- `packages/auth`: reusable frontend authentication provider, guard, hooks, and auth types.
- `packages/authorization`: reusable capability/scope authorization mechanics.
- `packages/tenancy`: reusable tenant/company context and guards.
- `apps/*/src/app/providers.tsx`: composes shared providers for that application.
- `apps/*/src/access`: app-specific roles, capabilities, scopes, and mappings.
- `apps/*/src/config`: app-specific runtime/environment configuration.
- `apps/*/src/routes`: routes and route path builders/constants.
- `apps/*/src/features`: product-specific features only.
- `apps/api`: Laravel API. Backend authentication, authorization, tenant isolation, validation, and business rules are enforced there.
