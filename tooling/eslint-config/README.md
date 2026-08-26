# @workforce-erp/eslint-config

Shared ESLint flat configuration for the Workforce ERP monorepo.

## Presets

- `workspace` / default: repository-wide linting and workspace boundary rules.
- `reactApp`: React + browser application source.
- `reactLibrary`: shared React library source.
- `nodeService`: Node.js services and workers.
- `nodeTooling`: repository scripts and engineering tooling.

The package keeps the authored configuration in `src/*.ts` and publishes/uses compiled `dist/*.js`. This avoids requiring a TypeScript loader just to start ESLint.

```js
import { reactApp } from "@workforce-erp/eslint-config";
export default reactApp;
```

Formatting rules intentionally stay out of ESLint. Prettier owns formatting.
