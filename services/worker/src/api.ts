import { workerConfig } from "./config";

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;
type ServiceTokenEnvelope = {
  success: boolean;
  data?: { access_token?: string; expires_at?: string };
};

let cachedToken = "";
let cachedTokenExpiresAt = 0;

function apiUrl(path: string): string {
  return `${workerConfig.apiUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

async function serviceToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedToken && cachedTokenExpiresAt > Date.now() + 30_000)
    return cachedToken;

  const response = await fetch(apiUrl(workerConfig.serviceTokenPath), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: workerConfig.serviceClientId,
      client_secret: workerConfig.serviceClientSecret,
      audience: workerConfig.serviceAudience,
    }),
  });
  if (!response.ok)
    throw new Error(
      `Worker service-token request failed: ${response.status} ${response.statusText}`,
    );

  const payload = (await response.json()) as ServiceTokenEnvelope;
  const token = payload.data?.access_token;
  const expires = Date.parse(payload.data?.expires_at ?? "");
  if (!payload.success || !token || !Number.isFinite(expires))
    throw new Error("Worker service-token response is invalid");

  cachedToken = token;
  cachedTokenExpiresAt = expires;
  return token;
}

async function send(path: string, init: RequestInit, refresh: boolean): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${await serviceToken(refresh)}`);
  return fetch(apiUrl(path), { ...init, headers });
}

export async function workerRequest<T extends JsonValue>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response = await send(path, init, false);
  if (response.status === 401) response = await send(path, init, true);

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Worker API request failed: ${response.status} ${response.statusText}${detail ? ` — ${detail.slice(0, 300)}` : ""}`,
    );
  }

  return (await response.json()) as T;
}
