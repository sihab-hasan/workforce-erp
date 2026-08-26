import type { QueryParams } from "@workforce-erp/contracts";
export function buildQueryString(query?: QueryParams): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, raw] of Object.entries(query)) {
    const values = Array.isArray(raw) ? raw : [raw];
    for (const value of values)
      if (value !== undefined && value !== null) params.append(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}
