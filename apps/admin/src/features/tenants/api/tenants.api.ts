import type { createHttpClient } from "@workforce-erp/api-client";
import type { PaginatedResponse, ApiResponse } from "@workforce-erp/contracts";
import type { TenantsFilters } from "../types/tenants-filters.types";
import type {
  TenantSummary,
  TenantDetails,
  CreateTenantPayload,
  UpdateTenantPayload,
} from "../types/tenants.types";

export function createTenantsApi(http: ReturnType<typeof createHttpClient>) {
  return {
    list(filters?: TenantsFilters): Promise<PaginatedResponse<TenantSummary>> {
      return http.get<PaginatedResponse<TenantSummary>>(
        "/api/v1/platform/tenants",
        filters as Record<string, string | number | boolean | undefined | null>,
      );
    },

    show(id: string | number): Promise<ApiResponse<TenantDetails>> {
      return http.get<ApiResponse<TenantDetails>>(
        `/api/v1/platform/tenants/${encodeURIComponent(String(id).trim())}`,
      );
    },

    create(payload: CreateTenantPayload): Promise<ApiResponse<TenantDetails>> {
      return http.post<ApiResponse<TenantDetails>>("/api/v1/platform/tenants", payload);
    },

    update(id: string | number, payload: UpdateTenantPayload): Promise<ApiResponse<TenantDetails>> {
      return http.put<ApiResponse<TenantDetails>>(
        `/api/v1/platform/tenants/${encodeURIComponent(String(id).trim())}`,
        payload,
      );
    },

    activate(id: string | number): Promise<ApiResponse<TenantDetails>> {
      return http.patch<ApiResponse<TenantDetails>>(
        `/api/v1/platform/tenants/${encodeURIComponent(String(id).trim())}/activate`,
      );
    },

    suspend(id: string | number): Promise<ApiResponse<TenantDetails>> {
      return http.patch<ApiResponse<TenantDetails>>(
        `/api/v1/platform/tenants/${encodeURIComponent(String(id).trim())}/suspend`,
      );
    },

    delete(id: string | number): Promise<ApiResponse<{ success: boolean; message: string }>> {
      return http.delete<ApiResponse<{ success: boolean; message: string }>>(
        `/api/v1/platform/tenants/${encodeURIComponent(String(id).trim())}`,
      );
    },
  };
}

export type TenantsApi = ReturnType<typeof createTenantsApi>;
