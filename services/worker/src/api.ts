import { workerConfig } from "./config";

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

export async function workerRequest<T extends JsonValue>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (workerConfig.apiToken) headers.set(workerConfig.apiTokenHeader, workerConfig.apiToken);

  const response = await fetch(
    `${workerConfig.apiUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`,
    { ...init, headers },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Worker API request failed: ${response.status} ${response.statusText}${detail ? ` — ${detail.slice(0, 300)}` : ""}`,
    );
  }

  return (await response.json()) as T;
}
