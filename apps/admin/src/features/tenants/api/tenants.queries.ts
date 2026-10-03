import { queryOptions } from "@tanstack/react-query";
import { createHttpClient } from "@workforce-erp/api-client";
import { environment } from "#config/env";
import { handleUnauthorized } from "#lib/api";
import { createTenantsApi } from "./tenants.api";
import type { TenantsFilters } from "../types/tenants-filters.types";

export const tenantsKeys = {
  all: ["tenants"] as const,
  lists: () => [...tenantsKeys.all, "list"] as const,
  list: (filters?: TenantsFilters) => [...tenantsKeys.lists(), filters] as const,
  details: () => [...tenantsKeys.all, "detail"] as const,
  detail: (id: string | number) => [...tenantsKeys.details(), String(id)] as const,
};

export function getTenantsApi() {
  const http = createHttpClient(environment.apiBaseUrl, handleUnauthorized);
  return createTenantsApi(http);
}

export function tenantsListQueryOptions(filters?: TenantsFilters) {
  const api = getTenantsApi();
  return queryOptions({
    queryKey: tenantsKeys.list(filters),
    queryFn: () => api.list(filters),
  });
}

export function tenantDetailQueryOptions(id: string | number) {
  const api = getTenantsApi();
  return queryOptions({
    queryKey: tenantsKeys.detail(id),
    queryFn: () => api.show(id),
    enabled: Boolean(id),
  });
}
