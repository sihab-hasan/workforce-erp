import { buildPermissionCheck } from "../ability/ability"
import { defaultPermissionMap } from "../ability/permission-map"

const defaultCan = buildPermissionCheck(defaultPermissionMap)

export function usePermission() {
  const permissions: string[] = []

  return {
    permissions,
    can: (requiredPermission: string) =>
      defaultCan(permissions, requiredPermission),
  }
}
