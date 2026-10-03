import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getTenantsApi, tenantsKeys } from "./tenants.queries";
import type { CreateTenantPayload, UpdateTenantPayload } from "../types/tenants.types";

export function useCreateTenantMutation() {
  const queryClient = useQueryClient();
  const api = getTenantsApi();

  return useMutation({
    mutationFn: (payload: CreateTenantPayload) => api.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tenantsKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["platform-analytics"] });
    },
  });
}

export function useUpdateTenantMutation() {
  const queryClient = useQueryClient();
  const api = getTenantsApi();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: UpdateTenantPayload }) =>
      api.update(id, payload),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: tenantsKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: tenantsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ["platform-analytics"] });
    },
  });
}

export function useActivateTenantMutation() {
  const queryClient = useQueryClient();
  const api = getTenantsApi();

  return useMutation({
    mutationFn: (id: string | number) => api.activate(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: tenantsKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: tenantsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ["platform-analytics"] });
    },
  });
}

export function useSuspendTenantMutation() {
  const queryClient = useQueryClient();
  const api = getTenantsApi();

  return useMutation({
    mutationFn: (id: string | number) => api.suspend(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: tenantsKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: tenantsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ["platform-analytics"] });
    },
  });
}

export function useDeleteTenantMutation() {
  const queryClient = useQueryClient();
  const api = getTenantsApi();

  return useMutation({
    mutationFn: (id: string | number) => api.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tenantsKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["platform-analytics"] });
    },
  });
}
