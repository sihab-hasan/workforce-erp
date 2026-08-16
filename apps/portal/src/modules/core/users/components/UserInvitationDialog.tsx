import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workforce-erp/ui/components/dialog"
import { useInviteUser } from "../api/users.mutations"
import { UserForm, type UserFormData } from "./UserForm"

export interface UserInvitationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserInvitationDialog({
  open,
  onOpenChange,
}: UserInvitationDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const inviteMutation = useInviteUser()

  const handleClose = () => {
    if (!inviteMutation.isPending) {
      setServerError(null)
      onOpenChange(false)
    }
  }

  const handleSubmit = (values: UserFormData) => {
    setServerError(null)
    inviteMutation.mutate(
      {
        name: values.name,
        email: values.email,
        role: values.role,
        organization_id: values.organization_id,
        employee_id: values.employee_id,
      },
      {
        onSuccess: (response) => {
          if (response.data?.invitation_delivered === false) {
            toast.warning(
              `User created, but invitation email delivery failed for ${values.email}.`
            )
          } else {
            toast.success(`Invitation sent to ${values.email}`)
          }
          onOpenChange(false)
        },
        onError: (err: unknown) => {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to send invitation. Please try again."
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
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Send an account invitation email with designated role, organization,
            and optional employee record link.
          </DialogDescription>
        </DialogHeader>

        <UserForm
          isPending={inviteMutation.isPending}
          serverError={serverError}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          submitLabel="Send Invitation"
        />
      </DialogContent>
    </Dialog>
  )
}
