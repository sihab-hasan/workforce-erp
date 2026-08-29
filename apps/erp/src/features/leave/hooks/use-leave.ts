import { useQuery } from "@tanstack/react-query";
import { apiGet } from "#features/erp-core/api";

interface CurrentProfile {
  user: { id: string; name: string; email: string };
  employee: { id: string; user_id?: string | null } | null;
}

/**
 * Employee profile linked to the authenticated user within the scoped
 * organisation/company. Reuses the `["profile"]` cache populated by the
 * profile settings page.
 */
export function useCurrentEmployee() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiGet<CurrentProfile>("/api/v1/profile"),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * ID of the current user's employee profile in the scoped company, or `null`
 * while loading / when no profile is linked. Used to identify the user's own
 * leave requests.
 */
export function useCurrentEmployeeId(): string | null {
  const { data } = useCurrentEmployee();
  return data?.employee?.id ?? null;
}
