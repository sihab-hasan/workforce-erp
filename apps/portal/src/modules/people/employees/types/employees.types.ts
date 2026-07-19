export type EmploymentStatus = "active" | "on-leave" | "probation" | "inactive"

export type EmploymentType = "full-time" | "part-time" | "contractor" | "intern"

export interface Employee {
  id: string
  /** Display name */
  name: string
  /** Two-letter initials derived from name */
  initials: string
  /** Job title */
  title: string
  /** Department name */
  department: string
  /** Employment type */
  employmentType: EmploymentType
  /** Employment status */
  status: EmploymentStatus
  /** Direct manager name */
  manager: string
  /** Work location / branch */
  location: string
  /** ISO 8601 hire date string */
  hireDate: string
  /** Employee email address */
  email: string
}
