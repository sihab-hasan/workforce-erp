import { useState, type FormEvent } from "react"
import { Loader2, Building2, Shield, UserCheck, AlertCircle } from "lucide-react"
import { Input } from "@workforce-erp/ui/components/input"
import { Label } from "@workforce-erp/ui/components/label"
import { Button } from "@workforce-erp/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workforce-erp/ui/components/select"
import { Skeleton } from "@workforce-erp/ui/components/skeleton"
import { useUserFormOptions } from "../hooks/use-user-options"
import {
  validateName,
  validateEmail,
  validateRole,
  type FieldErrors,
} from "../schemas/users.schema"
import type { UserRole } from "../types/users.types"

export interface UserFormData {
  name: string
  email: string
  role: UserRole
  organization_id?: string
  employee_id?: string | null
}

export interface UserFormProps {
  initialValues?: Partial<UserFormData>
  isPending: boolean
  serverError?: string | null
  onSubmit: (values: UserFormData) => void
  onCancel?: () => void
  submitLabel?: string
  className?: string
  hideEmail?: boolean
}

export function UserForm({
  initialValues,
  isPending,
  serverError,
  onSubmit,
  onCancel,
  submitLabel = "Send Invitation",
  className,
  hideEmail = false,
}: UserFormProps) {
  const {
    organizations,
    isOrgsPending,
    isOrgsError,
    roles,
    isRolesPending,
    isRolesError,
    employees,
    isEmployeesPending,
    isEmployeesError,
  } = useUserFormOptions()

  const [name, setName] = useState(initialValues?.name ?? "")
  const [email, setEmail] = useState(initialValues?.email ?? "")
  const [role, setRole] = useState<UserRole>(initialValues?.role ?? "staff")
  const [organizationId, setOrganizationId] = useState<string>(
    initialValues?.organization_id ?? "",
  )
  const [employeeId, setEmployeeId] = useState<string>(
    initialValues?.employee_id ?? "none",
  )

  const [errors, setErrors] = useState<FieldErrors<UserFormData>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof UserFormData, boolean>>>({})

  const validateForm = (): boolean => {
    const nextErrors: FieldErrors<UserFormData> = {}

    const nameErr = validateName(name)
    if (nameErr) nextErrors.name = nameErr

    if (!hideEmail) {
      const emailErr = validateEmail(email)
      if (emailErr) nextErrors.email = emailErr
    }

    const roleErr = validateRole(role)
    if (roleErr) nextErrors.role = roleErr

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleBlur = (field: keyof UserFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    if (field === "name") {
      setErrors((prev) => ({ ...prev, name: validateName(name) }))
    } else if (field === "email" && !hideEmail) {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }))
    } else if (field === "role") {
      setErrors((prev) => ({ ...prev, role: validateRole(role) }))
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, email: true, role: true })

    if (validateForm()) {
      onSubmit({
        name: name.trim(),
        email: email.trim(),
        role,
        organization_id: organizationId || undefined,
        employee_id: employeeId && employeeId !== "none" ? employeeId : null,
      })
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`space-y-4 ${className ?? ""}`}
    >
      {serverError && (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
        >
          {serverError}
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-1.5">
        <Label htmlFor="user-form-name">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="user-form-name"
          type="text"
          placeholder="e.g. Sarah Jenkins"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (touched.name) {
              setErrors((prev) => ({ ...prev, name: validateName(e.target.value) }))
            }
          }}
          onBlur={() => handleBlur("name")}
          aria-invalid={Boolean(errors.name)}
          disabled={isPending}
          autoComplete="name"
          required
        />
        {errors.name && (
          <p className="text-xs text-destructive" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email Field */}
      {!hideEmail && (
        <div className="space-y-1.5">
          <Label htmlFor="user-form-email">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="user-form-email"
            type="email"
            placeholder="e.g. s.jenkins@workforce.internal"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (touched.email) {
                setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }))
              }
            }}
            onBlur={() => handleBlur("email")}
            aria-invalid={Boolean(errors.email)}
            disabled={isPending}
            autoComplete="email"
            required
          />
          {errors.email && (
            <p className="text-xs text-destructive" role="alert">
              {errors.email}
            </p>
          )}
        </div>
      )}

      {/* Role Selection */}
      <div className="space-y-1.5">
        <Label htmlFor="user-form-role" className="flex items-center gap-1.5">
          <Shield className="size-3.5 text-muted-foreground" aria-hidden />
          <span>System Role <span className="text-destructive">*</span></span>
        </Label>
        {isRolesPending ? (
          <Skeleton className="h-9 w-full rounded-3xl" />
        ) : isRolesError ? (
          <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>Could not load roles. Defaulting to standard roles.</span>
          </div>
        ) : (
          <Select
            value={role}
            onValueChange={(val) => {
              setRole(val as UserRole)
              if (touched.role) {
                setErrors((prev) => ({ ...prev, role: validateRole(val) }))
              }
            }}
            disabled={isPending}
          >
            <SelectTrigger id="user-form-role" aria-label="Select system role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.slug} value={r.slug}>
                  <div className="flex flex-col">
                    <span className="font-medium">{r.name}</span>
                    {r.description && (
                      <span className="text-[11px] text-muted-foreground">
                        {r.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.role && (
          <p className="text-xs text-destructive" role="alert">
            {errors.role}
          </p>
        )}
      </div>

      {/* Organization Selection */}
      <div className="space-y-1.5">
        <Label htmlFor="user-form-org" className="flex items-center gap-1.5">
          <Building2 className="size-3.5 text-muted-foreground" aria-hidden />
          <span>Organization (Optional)</span>
        </Label>
        {isOrgsPending ? (
          <Skeleton className="h-9 w-full rounded-3xl" />
        ) : isOrgsError ? (
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
            <AlertCircle className="size-4 shrink-0" />
            <span>Organization will default to your current workspace.</span>
          </div>
        ) : organizations.length === 0 ? (
          <Input
            id="user-form-org"
            type="text"
            placeholder="Default Organization"
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            disabled={isPending}
          />
        ) : (
          <Select
            value={organizationId || "default"}
            onValueChange={(val) => setOrganizationId(val === "default" ? "" : val)}
            disabled={isPending}
          >
            <SelectTrigger id="user-form-org" aria-label="Select organization">
              <SelectValue placeholder="Select an organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Organization</SelectItem>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Employee Linking (Optional) */}
      <div className="space-y-1.5">
        <Label htmlFor="user-form-employee" className="flex items-center gap-1.5">
          <UserCheck className="size-3.5 text-muted-foreground" aria-hidden />
          <span>Link to Employee Profile (Optional)</span>
        </Label>
        {isEmployeesPending ? (
          <Skeleton className="h-9 w-full rounded-3xl" />
        ) : isEmployeesError ? (
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
            <span>Employee directory currently unavailable.</span>
          </div>
        ) : (
          <Select
            value={employeeId}
            onValueChange={setEmployeeId}
            disabled={isPending}
          >
            <SelectTrigger id="user-form-employee" aria-label="Link to an employee">
              <SelectValue placeholder="None (No employee profile linked)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="text-muted-foreground">None (No employee linked)</span>
              </SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{emp.name}</span>
                    {(emp.department || emp.designation) && (
                      <span className="text-[11px] text-muted-foreground">
                        {[emp.designation, emp.department].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Form actions */}
      <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
