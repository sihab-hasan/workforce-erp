# @workforce-erp/api-client

Frontend-to-backend API client utilities for Workforce ERP.

## Current surface

Today the package exports `createApiClient(options)`, which currently returns a simple client
configuration object. That makes the package real but still early in its implementation maturity.

## Workspace notes

- `openapi/workforce-api.yaml` is the current OpenAPI source artifact in the package.
- `src/codegen/openapi.config.ts` is the current codegen configuration entry point.
- `src/generated/` is reserved for generated client output.
- `src/http/` is reserved for shared transport helpers.

## Intended use

This package is the canonical typed client boundary that frontend apps should use to talk to the API
consistently. It still needs deeper transport, error-handling, and auth integration work as backend
implementation matures.
