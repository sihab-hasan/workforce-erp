import { useQuery } from "@tanstack/react-query"
import {
  organizationsQueryOptions,
  rolesQueryOptions,
  employeesQueryOptions,
} from "../api/users.queries"
import type { RoleOption } from "../types/users.types"

// Default static fallback role definitions if API is empty/unseeded
const DEFAULT_ROLES: RoleOption[] = [
  { id: "owner", name: "Owner", slug: "owner", description: "Full workspace ownership" },
  { id: "admin", name: "Administrator", slug: "admin", description: "System administrator" },
  { id: "manager", name: "Manager", slug: "manager", description: "Department & team manager" },
  { id: "staff", name: "Staff Member", slug: "staff", description: "Standard user access" },
  { id: "readonly", name: "Read Only", slug: "readonly", description: "View only access" },
]

/**
 * Fetches dynamic organizations list from API for dropdown selection.
 */
export function useOrganizations() {
  return useQuery(organizationsQueryOptions())
}

/**
 * Fetches dynamic roles list from API for dropdown selection.
 */
export function useRoles() {
  const query = useQuery(rolesQueryOptions())

  // If query returns data array, use it; otherwise provide typed default roles
  const roles: RoleOption[] =
    query.data?.data && query.data.data.length > 0
      ? query.data.data
      : DEFAULT_ROLES

  return {
    ...query,
    roles,
  }
}

/**
 * Fetches dynamic employees list from API for optional user-employee linking.
 */
export function useEmployees() {
  return useQuery(employeesQueryOptions())
}

/**
 * Unified hook that bundles all option queries needed by UserForm.
 */
export function useUserFormOptions() {
  const orgsQuery = useOrganizations()
  const rolesQuery = useRoles()
  const employeesQuery = useEmployees()

  return {
    organizations: orgsQuery.data?.data ?? [],
    isOrgsPending: orgsQuery.isPending,
    isOrgsError: orgsQuery.isError,

    roles: rolesQuery.roles,
    isRolesPending: rolesQuery.isPending,
    isRolesError: rolesQuery.isError,

    employees: employeesQuery.data?.data ?? [],
    isEmployeesPending: employeesQuery.isPending,
    isEmployeesError: employeesQuery.isError,
  }
}
