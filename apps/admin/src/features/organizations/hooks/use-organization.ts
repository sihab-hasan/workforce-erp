import { useQuery } from "@tanstack/react-query";
import { organizationDetailQueryOptions } from "../api/organizations.queries";

export function useOrganization(id: string | number) {
  return useQuery(organizationDetailQueryOptions(id));
}
