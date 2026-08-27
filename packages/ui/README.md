# @workforce-erp/ui

Shared design-system primitives and the shadcn/ui installation target.

## Public API

Use explicit package subpaths from other workspaces:

```ts
import { Button } from "@workforce-erp/ui/components/button";
import { Card } from "@workforce-erp/ui/components/card";
import { cn } from "@workforce-erp/ui/lib/utils";
```

Inside this package use private `#components/*`, `#hooks/*`, and `#lib/*` imports. The package does not expose its `src/` tree.

## Styles

Applications import `@workforce-erp/ui/globals.css` through their local `src/app.css`. Tailwind CSS v4 is processed by each Vite app.

## shadcn CLI

Each app and this package have matching `components.json` settings. Run `shadcn add` from an app workspace; shared primitives are routed to this package.
