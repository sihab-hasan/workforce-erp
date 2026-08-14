import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createHttpClient } from "@workforce-erp/api-client"
import { getStoredToken } from "@workforce-erp/auth-client"
import { environment } from "@/app/config/environment"
import { createUsersApi } from "./users.api"
import { usersKeys } from "../query-keys"
import type { InviteUserPayload, UpdateUserPayload } from "../types/users.types"

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function getUsersApi() {
  const http = createHttpClient(
    environment.apiBaseUrl,
    getStoredToken,
  )
  return createUsersApi(http)
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

/**
 * Invites a new user.
 * On success, invalidates the users list so it refreshes automatically.
 */
export function useInviteUser() {
  const queryClient = useQueryClient()
  const api = getUsersApi()

  return useMutation({
    mutationFn: (payload: InviteUserPayload) => api.invite(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
    },
  })
}

/**
 * Updates a user's basic account information for a pre-bound userId.
 * On success, invalidates the affected user's detail cache and the list.
 */
export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient()
  const api = getUsersApi()

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => api.update(userId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) })
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
    },
  })
}

/**
 * Dynamic mutation for updating any user's basic account information by ID.
 * On success, invalidates the affected user's detail cache and the list.
 */
export function useUpdateUserMutation() {
  const queryClient = useQueryClient()
  const api = getUsersApi()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      api.update(id, payload),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
    },
  })
}

/**
 * Activates a user account.
 * On success, invalidates both the user detail and the list.
 */
export function useActivateUser() {
  const queryClient = useQueryClient()
  const api = getUsersApi()

  return useMutation({
    mutationFn: (userId: string) => api.activate(userId),
    onSuccess: (_data, userId) => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) })
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
    },
  })
}

/**
 * Deactivates a user account.
 * On success, invalidates both the user detail and the list.
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient()
  const api = getUsersApi()

  return useMutation({
    mutationFn: (userId: string) => api.deactivate(userId),
    onSuccess: (_data, userId) => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) })
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
    },
  })
}

/**
 * Suspends a user account.
 * On success, invalidates both the user detail and the list.
 */
export function useSuspendUser() {
  const queryClient = useQueryClient()
  const api = getUsersApi()

  return useMutation({
    mutationFn: (userId: string) => api.suspend(userId),
    onSuccess: (_data, userId) => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) })
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
    },
  })
}

/**
 * Re-sends the invitation email to a user still in `invited` status.
 */
export function useResendInvitation() {
  const api = getUsersApi()

  return useMutation({
    mutationFn: (userId: string) => api.resendInvitation(userId),
  })
}
