import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export const typescript = defineConfig(...tseslint.configs.recommended, {
  name: "workforce/typescript",
  files: ["**/*.{ts,tsx,mts,cts}"],
  rules: {
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
    "@typescript-eslint/no-non-null-assertion": "warn",
  },
});
