import { useQuery } from "@tanstack/react-query";
import { tenantsListQueryOptions } from "../api/tenants.queries";
import type { TenantsFilters } from "../types/tenants-filters.types";

export function useTenants(filters?: TenantsFilters) {
  return useQuery(tenantsListQueryOptions(filters));
}
