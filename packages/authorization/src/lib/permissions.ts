import type { Permission } from "@workforce-erp/contracts";
function match(granted: Permission, required: Permission): boolean {
  if (granted === "*" || granted === required) return true;
  if (granted.endsWith(".*")) return required.startsWith(granted.slice(0, -1));
  return false;
}
export function hasPermission(granted: readonly Permission[], required: Permission): boolean {
  return granted.some((item) => match(item, required));
}
export function hasAnyPermission(
  granted: readonly Permission[],
  required: readonly Permission[],
): boolean {
  return required.some((item) => hasPermission(granted, item));
}
export function hasAllPermissions(
  granted: readonly Permission[],
  required: readonly Permission[],
): boolean {
  return required.every((item) => hasPermission(granted, item));
}
