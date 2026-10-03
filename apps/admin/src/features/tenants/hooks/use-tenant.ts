import { useQuery } from "@tanstack/react-query";
import { tenantDetailQueryOptions } from "../api/tenants.queries";

export function useTenant(id: string | number) {
  return useQuery(tenantDetailQueryOptions(id));
}
