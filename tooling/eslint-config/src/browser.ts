import globals from "globals";
import { defineConfig } from "eslint/config";

export const browser = defineConfig({
  name: "workforce/browser",
  files: ["**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}"],
  languageOptions: {
    globals: globals.browser,
  },
});
