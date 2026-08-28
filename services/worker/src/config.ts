function requiredAbsoluteUrl(value: string | undefined, fallback: string) {
  const candidate = (value?.trim() || fallback).replace(/\/+$/, "");
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:")
      throw new Error("unsupported protocol");
  } catch {
    throw new Error(`API_URL must be an absolute HTTP(S) URL. Received: ${candidate}`);
  }
  return candidate;
}

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function booleanEnv(value: string | undefined, fallback = false) {
  if (value === undefined || value.trim() === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

const enabled = booleanEnv(process.env.WORKER_ENABLED, false);
const jobsPath = process.env.WORKER_JOBS_PATH?.trim().replace(/^\/+/, "") ?? "";
const serviceClientId =
  process.env.SERVICE_CLIENT_ID?.trim() || process.env.WORKER_SERVICE_CLIENT_ID?.trim() || "";
const serviceClientSecret =
  process.env.SERVICE_CLIENT_SECRET?.trim() ||
  process.env.WORKER_SERVICE_CLIENT_SECRET?.trim() ||
  "";

if (enabled && !jobsPath) throw new Error("WORKER_JOBS_PATH is required when WORKER_ENABLED=true");
if (enabled && (!serviceClientId || !serviceClientSecret)) {
  throw new Error(
    "SERVICE_CLIENT_ID and SERVICE_CLIENT_SECRET are required when WORKER_ENABLED=true",
  );
}

export const workerConfig = {
  enabled,
  apiUrl: requiredAbsoluteUrl(process.env.API_URL, "http://127.0.0.1:8000/api"),
  serviceClientId,
  serviceClientSecret,
  serviceAudience:
    process.env.SERVICE_AUDIENCE?.trim() ||
    process.env.WORKER_SERVICE_AUDIENCE?.trim() ||
    "workforce-api",
  serviceTokenPath:
    process.env.SERVICE_TOKEN_PATH?.trim().replace(/^\/+/, "") || "v1/auth/service-token",
  jobsPath,
  pollIntervalMs: positiveInteger(process.env.WORKER_POLL_INTERVAL_MS, 15_000),
} as const;
