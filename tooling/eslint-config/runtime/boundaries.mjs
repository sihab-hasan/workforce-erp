import { defineConfig } from "eslint/config";

const importContractRestrictions = [
  {
    group: ["@/*"],
    message: "Do not use @/ aliases. Use package-local # imports for workspace internals.",
  },
  {
    group: ["@workforce-erp/*/src/*"],
    message:
      "Do not deep-import another workspace's src/. Consume only its public package exports.",
  },
];

const runtimePackageRestrictions = [
  ...importContractRestrictions,
  {
    group: [
      "apps/*",
      "services/*",
      "tooling/*",
      "e2e/*",
      "../../apps/*",
      "../../services/*",
      "../../tooling/*",
      "../../e2e/*",
      "../../../apps/*",
      "../../../services/*",
      "../../../tooling/*",
      "../../../e2e/*",
    ],
    message: "Runtime packages must not depend on apps, services, tooling, or E2E workspaces.",
  },
];

const appRestrictions = [
  ...importContractRestrictions,
  {
    group: [
      "apps/*",
      "../admin/*",
      "../erp/*",
      "../web/*",
      "../../apps/admin/*",
      "../../apps/erp/*",
      "../../apps/web/*",
    ],
    message:
      "Apps must communicate through shared packages/contracts, not by importing another app.",
  },
  {
    group: ["services/*", "../../services/*", "../../../services/*"],
    message: "Frontend apps must not import service implementation code directly.",
  },
];

export const boundaries = defineConfig(
  {
    name: "workforce/boundaries/runtime-packages",
    files: ["packages/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: runtimePackageRestrictions,
        },
      ],
    },
  },
  {
    name: "workforce/boundaries/apps",
    files: ["apps/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: appRestrictions,
        },
      ],
    },
  },
  {
    name: "workforce/boundaries/services",
    files: ["services/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...importContractRestrictions,
            {
              group: ["apps/*", "../../apps/*", "../../../apps/*"],
              message: "Services must not import frontend app implementations.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "workforce/boundaries/tooling-and-e2e",
    files: [
      "tooling/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}",
      "e2e/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: importContractRestrictions,
        },
      ],
    },
  },
);
