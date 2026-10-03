import { useQuery } from "@tanstack/react-query";
import { organizationsListQueryOptions } from "../api/organizations.queries";
import type { TenantsFilters } from "#features/tenants/types/tenants-filters.types";

export function useOrganizations(filters?: TenantsFilters) {
  return useQuery(organizationsListQueryOptions(filters));
}
