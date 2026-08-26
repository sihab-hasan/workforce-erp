import { defineConfig } from "eslint/config";
import workspace from "@workforce-erp/eslint-config";

export default defineConfig(
  ...workspace,
  {
    name: "workforce/ui-component-library",
    files: ["packages/ui/src/components/**/*.{ts,tsx}"],
    rules: {
      // UI primitives are treated as immutable/generated library code.
      // Keep application/package linting strict while avoiding edits to these files.
      "react-refresh/only-export-components": "off",
      "no-implicit-coercion": "off",
      "object-shorthand": "off",
    },
  },
  {
    name: "workforce/ui-field-generated-exception",
    files: ["packages/ui/src/components/field.tsx"],
    rules: {
      // field.tsx is intentionally left untouched with the rest of ui/components.
      eqeqeq: "off",
    },
  },
  {
    name: "workforce/routes-and-page-exports",
    files: [
      "apps/**/src/routes/**/*.{ts,tsx}",
      "apps/**/src/pages/**/*.{ts,tsx}",
      "apps/**/src/features/**/index.{ts,tsx}",
      "apps/**/src/features/**/pages/**/*.{ts,tsx}",
    ],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
);
