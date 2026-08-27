import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";

export const ignores = globalIgnores([
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/coverage/**",
  "**/.nx/**",
  "**/.vite/**",
  "**/test-results/**",
  "**/.cache/**",
  "**/*.min.js",
]);

export const base = defineConfig(ignores, js.configs.recommended, {
  name: "workforce/base",
  linterOptions: {
    reportUnusedDisableDirectives: "error",
  },
  rules: {
    eqeqeq: ["error", "always", { null: "ignore" }],
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "error",
    "no-duplicate-imports": "error",
    "no-implicit-coercion": "error",
    "no-unneeded-ternary": "error",
    "object-shorthand": ["error", "always"],
    "prefer-const": "error",
    "prefer-template": "error",
  },
});
