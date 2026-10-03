import type { createHttpClient } from "@workforce-erp/api-client";
import type { PaginatedResponse, ApiResponse } from "@workforce-erp/contracts";
import type {
  OrganizationSummary,
  OrganizationDetails,
  UpdateOrganizationCorporatePayload,
} from "../types/organizations.types";
import type { TenantsFilters } from "#features/tenants/types/tenants-filters.types";

export function createOrganizationsApi(http: ReturnType<typeof createHttpClient>) {
  return {
    list(filters?: TenantsFilters): Promise<PaginatedResponse<OrganizationSummary>> {
      return http.get<PaginatedResponse<OrganizationSummary>>(
        "/api/v1/platform/organizations",
        filters as Record<string, string | number | boolean | undefined | null>,
      );
    },

    show(id: string | number): Promise<ApiResponse<OrganizationDetails>> {
      return http.get<ApiResponse<OrganizationDetails>>(
        `/api/v1/platform/organizations/${encodeURIComponent(String(id).trim())}`,
      );
    },

    update(
      id: string | number,
      payload: UpdateOrganizationCorporatePayload,
    ): Promise<ApiResponse<OrganizationDetails>> {
      return http.put<ApiResponse<OrganizationDetails>>(
        `/api/v1/platform/organizations/${encodeURIComponent(String(id).trim())}`,
        payload,
      );
    },
  };
}

export type OrganizationsApi = ReturnType<typeof createOrganizationsApi>;
