import { useQuery } from "@tanstack/react-query";
import { apiClient } from "#lib/api";
import type { PlatformAnalytics } from "../types/dashboard.types";

export function useDashboardAnalytics(range: string = "30d") {
  return useQuery<PlatformAnalytics>({
    queryKey: ["platform-analytics", range],
    queryFn: async () => {
      const res = await apiClient.analytics(range);
      return res.data;
    },
    staleTime: 1000 * 30, // 30 seconds fresh
    refetchInterval: 1000 * 60, // auto refetch every minute
  });
}
