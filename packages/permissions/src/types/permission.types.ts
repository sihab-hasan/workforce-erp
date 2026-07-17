export type PermissionMap = Record<string, string>

export type PermissionCheck = (
  permissions: readonly string[],
  requiredPermission: string
) => boolean
