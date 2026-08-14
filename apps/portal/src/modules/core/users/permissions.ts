/**
 * Permission action constants for the Users module.
 *
 * Used with the `Can` / `RequirePermission` components and `usePermission` hook
 * from `@workforce-erp/permissions`.
 *
 * @example
 * <Can action={USER_PERMISSIONS.invite} subject="User">
 *   <InviteUserButton />
 * </Can>
 */
export const USER_PERMISSIONS = {
  /** View the users list */
  list: "users:list",
  /** View a user's full detail */
  view: "users:view",
  /** Invite / create a new user */
  invite: "users:invite",
  /** Update a user's name, role, or employee link */
  update: "users:update",
  /** Activate an inactive or invited account */
  activate: "users:activate",
  /** Deactivate an active account */
  deactivate: "users:deactivate",
  /** Re-send an invitation email */
  resendInvitation: "users:resend-invitation",
} as const

export type UserPermission = (typeof USER_PERMISSIONS)[keyof typeof USER_PERMISSIONS]
