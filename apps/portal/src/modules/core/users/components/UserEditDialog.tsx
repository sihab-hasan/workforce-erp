import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workforce-erp/ui/components/dialog"
import { useUpdateUserMutation } from "../api/users.mutations"
import { UserForm, type UserFormData } from "./UserForm"
import type { UserSummary } from "../types/users.types"

export interface UserEditDialogProps {
  user: UserSummary | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserEditDialog({
  user,
  open,
  onOpenChange,
}: UserEditDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const updateMutation = useUpdateUserMutation()

  if (!user) return null

  const handleClose = () => {
    if (!updateMutation.isPending) {
      setServerError(null)
      onOpenChange(false)
    }
  }

  const handleSubmit = (values: UserFormData) => {
    setServerError(null)
    updateMutation.mutate(
      {
        id: user.id,
        payload: {
          name: values.name,
          email: values.email,
          role: values.role,
          organization_id: values.organization_id,
          employee_id: values.employee_id,
        },
      },
      {
        onSuccess: () => {
          toast.success(`User details updated successfully`)
          setServerError(null)
          onOpenChange(false)
        },
        onError: (err: unknown) => {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to update user. Please try again."
          setServerError(message)
          toast.error(message)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
          <DialogDescription>
            Update account details, role, organization, and linked employee
            record for {user.name}.
          </DialogDescription>
        </DialogHeader>

        <UserForm
          key={user.id}
          initialValues={{
            name: user.name,
            email: user.email,
            role: user.role,
            organization_id: user.organization_id,
            employee_id: user.employee_id ?? "none",
          }}
          hideEmail={false}
          isPending={updateMutation.isPending}
          serverError={serverError}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          submitLabel="Save Changes"
        />
      </DialogContent>
    </Dialog>
  )
}
