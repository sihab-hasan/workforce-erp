# @workforce-erp/prettier-config

Single formatting policy for apps, services, packages, tooling, tests, docs, and repository configuration.

The root `prettier.config.mjs` re-exports this package's configuration, so there is only one formatting source of truth.

```js
export { default } from "./tooling/prettier-config/prettier.config.mjs";
```

No import-sorting plugin is included. Import semantics and architectural restrictions belong to ESLint; Prettier only formats.
