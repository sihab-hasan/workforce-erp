import globals from "globals";
import { defineConfig } from "eslint/config";

export const node = defineConfig({
  name: "workforce/node",
  files: ["**/*.{js,ts,mjs,cjs,mts,cts}", "**/*.config.{js,ts,mjs,cjs,mts,cts}"],
  languageOptions: {
    globals: globals.node,
  },
  rules: {
    "no-console": "off",
  },
});
