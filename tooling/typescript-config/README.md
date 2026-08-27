# @workforce-erp/typescript-config

Shared TypeScript compiler-policy presets.

| Config               | Use                                         |
| -------------------- | ------------------------------------------- |
| `base.json`          | Strict language and safety defaults only    |
| `browser.json`       | Browser/Vite/bundler environments           |
| `react-app.json`     | React applications                          |
| `react-library.json` | Shared React packages                       |
| `node.json`          | Node.js programs                            |
| `node-library.json`  | Emitting Node.js libraries/tooling packages |
| `worker.json`        | `services/worker`                           |

Consumer configs own project-specific `include`, `exclude`, aliases, and build output directories. Shared configs do not hard-code repository paths.

```json
{
  "extends": "@workforce-erp/typescript-config/react-app.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
```
