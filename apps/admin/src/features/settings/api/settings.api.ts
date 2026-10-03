import { cookieApiClient } from "#lib/api";
import type { PlatformSettings, SystemHealthData } from "../types/settings.types";

export async function fetchPlatformSettings(): Promise<PlatformSettings> {
  const res = await cookieApiClient.get<{
    success: boolean;
    data: PlatformSettings;
  }>("/api/v1/platform/settings");
  return res.data;
}

export async function updatePlatformSettings(
  payload: Partial<PlatformSettings>,
): Promise<PlatformSettings> {
  const res = await cookieApiClient.put<{
    success: boolean;
    message: string;
    data: PlatformSettings;
  }>("/api/v1/platform/settings", payload);
  return res.data;
}

export async function clearPlatformCache(): Promise<{ success: boolean; message: string }> {
  const res = await cookieApiClient.post<{
    success: boolean;
    message: string;
  }>("/api/v1/platform/settings/cache-clear", {});
  return res;
}

export async function fetchSystemHealth(): Promise<SystemHealthData> {
  const res = await cookieApiClient.get<{
    success: boolean;
    data: SystemHealthData;
  }>("/api/v1/platform/settings/health");
  return res.data;
}
