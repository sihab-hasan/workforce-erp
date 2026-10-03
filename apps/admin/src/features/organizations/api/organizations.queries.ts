import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { createHttpClient } from "@workforce-erp/api-client";
import { environment } from "#config/env";
import { handleUnauthorized } from "#lib/api";
import { createOrganizationsApi } from "./organizations.api";
import type { TenantsFilters } from "#features/tenants/types/tenants-filters.types";
import type { UpdateOrganizationCorporatePayload } from "../types/organizations.types";

export const organizationsKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationsKeys.all, "list"] as const,
  list: (filters?: TenantsFilters) => [...organizationsKeys.lists(), filters] as const,
  details: () => [...organizationsKeys.all, "detail"] as const,
  detail: (id: string | number) => [...organizationsKeys.details(), String(id)] as const,
};

export function getOrganizationsApi() {
  const http = createHttpClient(environment.apiBaseUrl, handleUnauthorized);
  return createOrganizationsApi(http);
}

export function organizationsListQueryOptions(filters?: TenantsFilters) {
  const api = getOrganizationsApi();
  return queryOptions({
    queryKey: organizationsKeys.list(filters),
    queryFn: () => api.list(filters),
  });
}

export function organizationDetailQueryOptions(id: string | number) {
  const api = getOrganizationsApi();
  return queryOptions({
    queryKey: organizationsKeys.detail(id),
    queryFn: () => api.show(id),
    enabled: Boolean(id),
  });
}

export function useUpdateOrganizationMutation() {
  const queryClient = useQueryClient();
  const api = getOrganizationsApi();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: UpdateOrganizationCorporatePayload;
    }) => api.update(id, payload),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: organizationsKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: organizationsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}
