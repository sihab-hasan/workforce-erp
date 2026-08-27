import { useState } from "react";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  UserCheck,
  UserX,
  ShieldAlert,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workforce-erp/ui/components/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workforce-erp/ui/components/alert-dialog";
import {
  useActivateUser,
  useDeactivateUser,
  useSuspendUser,
  useResendInvitation,
} from "../api/users.mutations";
import type { UserSummary } from "../types/users.types";
import { adminUserDetailsPath } from "#routes/paths";

export interface UserActionsMenuProps {
  user: UserSummary;
  onEdit: (user: UserSummary) => void;
}

type ConfirmActionType = "deactivate" | "suspend" | null;

export function UserActionsMenu({ user, onEdit }: UserActionsMenuProps) {
  const navigate = useNavigate();
  const [confirmAction, setConfirmAction] = useState<ConfirmActionType>(null);

  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();
  const suspendMutation = useSuspendUser();
  const resendMutation = useResendInvitation();

  const isPerformingAction =
    activateMutation.isPending ||
    deactivateMutation.isPending ||
    suspendMutation.isPending ||
    resendMutation.isPending;

  const handleActivate = () => {
    activateMutation.mutate(
      { id: user.id, organizationId: user.organization_id },
      {
        onSuccess: () => {
          toast.success(`Account for ${user.name} has been activated.`);
        },
        onError: (err: unknown) => {
          toast.error(err instanceof Error ? err.message : "Failed to activate user.");
        },
      },
    );
  };

  const handleDeactivate = () => {
    deactivateMutation.mutate(
      { id: user.id, organizationId: user.organization_id },
      {
        onSuccess: () => {
          toast.success(`Account for ${user.name} has been deactivated.`);
          setConfirmAction(null);
        },
        onError: (err: unknown) => {
          toast.error(err instanceof Error ? err.message : "Failed to deactivate user.");
        },
      },
    );
  };

  const handleSuspend = () => {
    suspendMutation.mutate(
      { id: user.id, organizationId: user.organization_id },
      {
        onSuccess: () => {
          toast.success(`Account for ${user.name} has been suspended.`);
          setConfirmAction(null);
        },
        onError: (err: unknown) => {
          toast.error(err instanceof Error ? err.message : "Failed to suspend user.");
        },
      },
    );
  };

  const handleResend = () => {
    resendMutation.mutate(
      { id: user.id, organizationId: user.organization_id },
      {
        onSuccess: (response) => {
          if (response.data?.delivered === true) {
            toast.success(`Invitation email resent to ${user.email}.`);
          } else {
            toast.error(`Invitation email could not be delivered to ${user.email}.`);
          }
        },
        onError: (err: unknown) => {
          toast.error(err instanceof Error ? err.message : "Failed to resend invitation.");
        },
      },
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${user.name}`}
              disabled={isPerformingAction}
            />
          }
        >
          {isPerformingAction ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <MoreHorizontal className="size-4" aria-hidden />
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => navigate(adminUserDetailsPath(user.id))}>
            <Eye className="mr-2 size-4" />
            <span>View Details</span>
          </DropdownMenuItem>

          {/* Edit info */}
          <DropdownMenuItem onClick={() => onEdit(user)}>
            <Pencil className="mr-2 size-4" />
            <span>Edit Details</span>
          </DropdownMenuItem>

          {/* Resend Invitation (for invited users) */}
          {user.status === "invited" && (
            <DropdownMenuItem onClick={handleResend}>
              <Send className="mr-2 size-4" />
              <span>Resend Invitation</span>
            </DropdownMenuItem>
          )}

          {/* Activate Account */}
          {(user.status === "inactive" ||
            user.status === "suspended" ||
            user.status === "invited") && (
            <DropdownMenuItem onClick={handleActivate}>
              <UserCheck className="mr-2 size-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400">Activate Account</span>
            </DropdownMenuItem>
          )}

          {/* Actions for Active users */}
          {user.status === "active" && (
            <>
              <DropdownMenuSeparator />

              {/* Suspend */}
              <DropdownMenuItem onClick={() => setConfirmAction("suspend")}>
                <ShieldAlert className="mr-2 size-4 text-amber-600 dark:text-amber-400" />
                <span className="text-amber-600 dark:text-amber-400">Suspend Account</span>
              </DropdownMenuItem>

              {/* Deactivate */}
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirmAction("deactivate")}
              >
                <UserX className="mr-2 size-4 text-destructive" />
                <span>Deactivate Account</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog for Deactivate / Suspend */}
      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "deactivate"
                ? `Deactivate ${user.name}?`
                : `Suspend ${user.name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "deactivate"
                ? "This will revoke all access for this user immediately without deleting their record or activity history. You can reactivate them later."
                : "This will temporarily lock this user account. The user will not be able to log in until unsuspended."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPerformingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={
                confirmAction === "deactivate"
                  ? "text-destructive-foreground bg-destructive hover:bg-destructive/90"
                  : "bg-amber-600 text-white hover:bg-amber-700"
              }
              onClick={(e) => {
                e.preventDefault();
                if (confirmAction === "deactivate") {
                  handleDeactivate();
                } else if (confirmAction === "suspend") {
                  handleSuspend();
                }
              }}
              disabled={isPerformingAction}
            >
              {isPerformingAction && <Loader2 className="mr-2 size-4 animate-spin" />}
              {confirmAction === "deactivate" ? "Deactivate User" : "Suspend User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
