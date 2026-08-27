import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const EXAMPLE_FILE = path.join(ROOT_DIR, ".env.docker.example");
const ENV_FILE = path.join(ROOT_DIR, ".env.docker");

if (!fs.existsSync(EXAMPLE_FILE)) {
  console.error(`ERROR: Example file not found at ${EXAMPLE_FILE}`);
  process.exit(1);
}

if (!fs.existsSync(ENV_FILE)) {
  console.log(`Copying ${EXAMPLE_FILE} to ${ENV_FILE}...`);
  fs.copyFileSync(EXAMPLE_FILE, ENV_FILE);
} else {
  console.log(`Using existing ${ENV_FILE}`);
}

let envContent = fs.readFileSync(ENV_FILE, "utf8");

function replacePlaceholder(key, placeholder, value) {
  const regex = new RegExp(`^${key}=${placeholder}\\s*$`, "m");
  if (regex.test(envContent)) {
    console.log(`Generating secure value for ${key}...`);
    envContent = envContent.replace(regex, `${key}=${value}`);
  }
}

// 1. APP_KEY
const appKey = `base64:${crypto.randomBytes(32).toString("base64")}`;
replacePlaceholder("APP_KEY", "__GENERATE_APP_KEY__", appKey);

// 2. Database Password (reused for MYSQL_PASSWORD and DB_PASSWORD)
const dbPassword = crypto.randomBytes(24).toString("hex");
replacePlaceholder("DB_PASSWORD", "__GENERATE_DB_PASSWORD__", dbPassword);
replacePlaceholder("MYSQL_PASSWORD", "__GENERATE_DB_PASSWORD__", dbPassword);

// 3. MySQL Root Password
const mysqlRootPassword = crypto.randomBytes(32).toString("hex");
replacePlaceholder("MYSQL_ROOT_PASSWORD", "__GENERATE_MYSQL_ROOT_PASSWORD__", mysqlRootPassword);

// 4. Redis Password
const redisPassword = crypto.randomBytes(32).toString("hex");
replacePlaceholder("REDIS_PASSWORD", "__GENERATE_REDIS_PASSWORD__", redisPassword);

// 5. API Shared Token
const apiSharedToken = crypto.randomBytes(32).toString("hex");
replacePlaceholder("API_SHARED_TOKEN", "__GENERATE_API_SHARED_TOKEN__", apiSharedToken);

fs.writeFileSync(ENV_FILE, envContent, "utf8");

try {
  fs.chmodSync(ENV_FILE, 0o600);
} catch (err) {
  console.warn(`Warning: Could not set file permissions of .env.docker: ${err.message}`);
}

console.log("\nDocker environment ready: .env.docker");
console.log("\nStart the stack:");
console.log("  docker compose --env-file .env.docker -f infra/docker-compose.yml up -d --build");
console.log("\nCheck status:");
console.log("  docker compose --env-file .env.docker -f infra/docker-compose.yml ps");
console.log("\nLocal URLs:");
console.log("  http://web.localhost");
console.log("  http://erp.localhost");
console.log("  http://admin.localhost");
console.log("  http://api.localhost/api/health");
