import { apiClient, uploadForm, downloadFile } from "#lib/api";

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number | null;
    to?: number | null;
  };
}

export interface Paginated<T> {
  items: T[];
  meta: ApiEnvelope<T[]>["meta"];
}

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const options = params === undefined ? {} : { params };
  const response = await apiClient.get<ApiEnvelope<T>>(url, options);
  return response.data;
}

export async function apiGetPaginated<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<Paginated<T>> {
  const options = params === undefined ? {} : { params };
  const response = await apiClient.get<ApiEnvelope<T[]>>(url, options);
  return { items: response.data ?? [], meta: response.meta };
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.post<ApiEnvelope<T>>(url, body);
  return response.data;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.put<ApiEnvelope<T>>(url, body);
  return response.data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.patch<ApiEnvelope<T>>(url, body);
  return response.data;
}

export async function apiDelete(url: string): Promise<void> {
  await apiClient.delete<ApiEnvelope<null>>(url);
}

export async function apiUpload<T>(url: string, form: FormData): Promise<T> {
  const response = await uploadForm<ApiEnvelope<T>>(url, form);
  return response.data;
}

export { downloadFile };

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}
