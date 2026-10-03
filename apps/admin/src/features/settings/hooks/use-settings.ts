import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  clearPlatformCache,
  fetchPlatformSettings,
  fetchSystemHealth,
  updatePlatformSettings,
} from "../api/settings.api";
import type { PlatformSettings } from "../types/settings.types";

const SETTINGS_QUERY_KEY = ["platform", "settings"];
const HEALTH_QUERY_KEY = ["platform", "health"];

export function useSettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: fetchPlatformSettings,
    staleTime: 1000 * 60 * 5,
  });

  const healthQuery = useQuery({
    queryKey: HEALTH_QUERY_KEY,
    queryFn: fetchSystemHealth,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<PlatformSettings>) => updatePlatformSettings(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, data);
      toast.success("Settings saved successfully", {
        description: "Platform configuration parameters updated across all clusters.",
      });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update platform settings. Please check permissions.";
      toast.error("Save Error", { description: message });
    },
  });

  const clearCacheMutation = useMutation({
    mutationFn: clearPlatformCache,
    onSuccess: (res) => {
      toast.success("System Cache Flushed", {
        description: res.message || "Application cache and compiled views cleared.",
      });
      queryClient.invalidateQueries({ queryKey: HEALTH_QUERY_KEY });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to flush application cache.";
      toast.error("Flush Failed", { description: message });
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    refetchSettings: settingsQuery.refetch,
    health: healthQuery.data,
    isHealthLoading: healthQuery.isLoading,
    refetchHealth: healthQuery.refetch,
    updateSettings: updateMutation.mutateAsync,
    isSaving: updateMutation.isPending,
    clearCache: clearCacheMutation.mutateAsync,
    isClearingCache: clearCacheMutation.isPending,
  };
}
