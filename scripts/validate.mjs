import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const required = [
  "nx.json",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "tsconfig.base.json",
  "apps/web",
  "apps/erp",
  "apps/admin",
  "apps/api/project.json",
  "services/worker",
  "packages/ui",
  "packages/authorization",
  "infra/docker-compose.yml",
];

const forbidden = ["turbo.json", "package-lock.json", "yarn.lock", "bun.lock", "bun.lockb"];

const errors = [];
const missing = required.filter((item) => !fs.existsSync(item));
if (missing.length) {
  errors.push(`Missing required project paths:\n  - ${missing.join("\n  - ")}`);
}

const unexpected = forbidden.filter((item) => fs.existsSync(item));
if (unexpected.length) {
  errors.push(
    `Unexpected workspace-manager files found (this repository is Nx + pnpm only):\n  - ${unexpected.join("\n  - ")}`,
  );
}

try {
  const rootPackage = JSON.parse(fs.readFileSync("package.json", "utf8"));
  if (!String(rootPackage.packageManager ?? "").startsWith("pnpm@")) {
    errors.push('package.json must pin pnpm through the "packageManager" field');
  }
  if (!rootPackage.devDependencies?.nx) {
    errors.push("Nx must be installed in root devDependencies");
  }
} catch (error) {
  errors.push(
    `Unable to parse package.json: ${error instanceof Error ? error.message : String(error)}`,
  );
}

const env = {};
for (const file of [".env.example", ".env"]) {
  const fullPath = path.resolve(file);
  if (!fs.existsSync(fullPath)) continue;
  for (const rawLine of fs.readFileSync(fullPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index < 0) continue;
    const key = line.slice(0, index).trim();
    env[key] = line
      .slice(index + 1)
      .trim()
      .replace(/^(["'])(.*)\1$/, "$2");
  }
}
Object.assign(env, process.env);

function readPort(name) {
  const value = Number(env[name]);
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    errors.push(`${name} must be an integer between 1 and 65535`);
    return null;
  }
  return value;
}

function uniquePorts(names, label) {
  const used = new Map();
  for (const name of names) {
    const port = readPort(name);
    if (port === null) continue;
    if (used.has(port))
      errors.push(`${name} conflicts with ${used.get(port)} on ${label} port ${port}`);
    else used.set(port, name);
  }
}

function booleanValue(name) {
  const value = (env[name] ?? "").trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(value)) return true;
  if (["", "0", "false", "no", "off"].includes(value)) return false;
  errors.push(`${name} must be a boolean value (true/false, 1/0, yes/no, on/off)`);
  return false;
}

function absoluteHttpUrl(name, optional = false) {
  const value = env[name]?.trim();
  if (!value && optional) return;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
  } catch {
    errors.push(`${name} must be ${optional ? "blank or " : ""}an absolute HTTP(S) URL`);
  }
}

uniquePorts(
  [
    "WEB_DEV_PORT",
    "ERP_DEV_PORT",
    "ADMIN_DEV_PORT",
    "WEB_PREVIEW_PORT",
    "ERP_PREVIEW_PORT",
    "ADMIN_PREVIEW_PORT",
  ],
  "local",
);
uniquePorts(["WEB_PORT", "ERP_PORT", "ADMIN_PORT"], "Docker host");

for (const name of [
  "VITE_WEB_URL",
  "VITE_ERP_URL",
  "VITE_ADMIN_URL",
  "VITE_API_PROXY_TARGET",
  "API_URL",
  "PUBLIC_WEB_URL",
  "PUBLIC_ERP_URL",
  "PUBLIC_ADMIN_URL",
  "PUBLIC_API_BASE_URL",
  "PUBLIC_API_URL",
  "WORKER_API_URL",
]) {
  absoluteHttpUrl(name);
}

absoluteHttpUrl("VITE_API_BASE_URL", true);
if (env.VITE_API_URL && !env.VITE_API_URL.startsWith("/")) absoluteHttpUrl("VITE_API_URL");

const workerEnabled = booleanValue("WORKER_ENABLED");
if (workerEnabled) {
  if (!(env.WORKER_JOBS_PATH ?? "").trim()) {
    errors.push("WORKER_JOBS_PATH is required when WORKER_ENABLED=true");
  }
  const workerClientId = (env.SERVICE_CLIENT_ID ?? env.WORKER_SERVICE_CLIENT_ID ?? "").trim();
  const workerClientSecret = (
    env.SERVICE_CLIENT_SECRET ??
    env.WORKER_SERVICE_CLIENT_SECRET ??
    ""
  ).trim();
  if (!workerClientId) errors.push("WORKER_SERVICE_CLIENT_ID is required when WORKER_ENABLED=true");
  if (!workerClientSecret)
    errors.push("WORKER_SERVICE_CLIENT_SECRET is required when WORKER_ENABLED=true");
}

if (errors.length) {
  console.error(`Repository validation failed:\n  - ${errors.join("\n  - ")}`);
  process.exit(1);
}

console.log("Repository structure and connection configuration valid");
console.log("  Workspace: Nx + pnpm");
console.log(`  Web   http://localhost:${env.WEB_DEV_PORT}`);
console.log(`  ERP   http://localhost:${env.ERP_DEV_PORT}`);
console.log(`  Admin http://localhost:${env.ADMIN_DEV_PORT}`);
console.log(`  API   ${env.VITE_API_PROXY_TARGET}`);
