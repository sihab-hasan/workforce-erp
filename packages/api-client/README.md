# @workforce-erp/api-client

Frontend-to-backend API client utilities for Workforce ERP.

## Current surface

Today the package exports `createApiClient(options)`, which returns a simple client configuration object.

## Workspace notes

- `openapi/workforce-api.yaml` is the current OpenAPI source artifact in the package.
- `src/codegen/openapi.config.ts` is the current codegen placeholder.
- `src/generated/` is reserved for generated client output.
- `src/http/` is reserved for shared transport helpers.

## Intended use

This package is the future typed client boundary that frontend apps should use to talk to the API consistently.
