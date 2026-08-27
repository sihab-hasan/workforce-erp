import { defineConfig } from "eslint/config";
import { base } from "./base.js";
import { boundaries } from "./boundaries.js";
import { browser } from "./browser.js";
import { node } from "./node.js";
import { react } from "./react.js";
import { typescript } from "./typescript.js";

export const workspace = defineConfig(
  ...base,
  ...typescript,
  ...boundaries,
  {
    name: "workforce/workspace/browser-scopes",
    files: ["apps/**/*.{js,jsx,ts,tsx}", "packages/**/*.{js,jsx,ts,tsx}"],
    extends: browser,
  },
  {
    name: "workforce/workspace/node-scopes",
    files: [
      "services/**/*.{js,ts,mjs,cjs,mts,cts}",
      "tooling/**/*.{js,ts,mjs,cjs,mts,cts}",
      "scripts/**/*.{js,ts,mjs,cjs,mts,cts}",
      "e2e/**/*.{js,ts,mjs,cjs,mts,cts}",
      "*.config.{js,ts,mjs,cjs,mts,cts}",
    ],
    extends: node,
  },
  {
    name: "workforce/workspace/react-scopes",
    files: ["apps/**/*.{jsx,tsx}", "packages/**/*.{jsx,tsx}"],
    extends: react,
  },
);

export const reactApp = defineConfig(...base, ...typescript, ...browser, ...react);

export const reactLibrary = defineConfig(...base, ...typescript, ...browser, ...react);

export const nodeService = defineConfig(...base, ...typescript, ...node);

export const nodeTooling = defineConfig(...base, ...typescript, ...node);

export default workspace;
