export const employeesKeys = {
  all: ["employees"] as const,
  lists: () => [...employeesKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...employeesKeys.lists(), params ?? {}] as const,
  options: () => [...employeesKeys.all, "options"] as const,
  summary: () => [...employeesKeys.all, "summary"] as const,
}
