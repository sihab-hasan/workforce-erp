import type { PermissionCheck, PermissionMap } from "../types/permission.types"

export function canAccess(
  permissions: readonly string[],
  requiredPermission: string
) {
  return permissions.includes(requiredPermission)
}

export function buildPermissionCheck(
  permissionMap: PermissionMap
): PermissionCheck {
  return (permissions, requiredPermission) => {
    const normalizedPermission =
      permissionMap[requiredPermission] ?? requiredPermission

    return canAccess(permissions, normalizedPermission)
  }
}
