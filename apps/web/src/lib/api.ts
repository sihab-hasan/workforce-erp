import { createApiClient, type ApiClientOptions } from "@workforce-erp/api-client";
import { apiConfig } from "#config/api";

export function createAppApiClient(options: Omit<ApiClientOptions, "baseUrl"> = {}) {
  return createApiClient({
    ...apiConfig,
    ...options,
  });
}
