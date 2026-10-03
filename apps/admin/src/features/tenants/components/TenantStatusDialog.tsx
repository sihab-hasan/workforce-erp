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
import { Loader2, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import type { TenantSummary } from "../types/tenants.types";

export interface TenantStatusDialogProps {
  tenant: TenantSummary | null;
  action: "activate" | "suspend" | "delete" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function TenantStatusDialog({
  tenant,
  action,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: TenantStatusDialogProps) {
  if (!tenant || !action) return null;

  const isSuspend = action === "suspend";
  const isDelete = action === "delete";
  const isActivate = action === "activate";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            {isSuspend && <ShieldAlert className="size-5 text-amber-500" />}
            {isDelete && <Trash2 className="size-5 text-destructive" />}
            {isActivate && <ShieldCheck className="size-5 text-emerald-500" />}
            <AlertDialogTitle>
              {isSuspend && `Suspend ${tenant.name}?`}
              {isActivate && `Activate ${tenant.name}?`}
              {isDelete && `Delete ${tenant.name}?`}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs">
            {isSuspend &&
              "Suspending this organization will immediately pause access for all its users and employees. Data is retained safely and can be restored at any time."}
            {isActivate &&
              "Activating this organization will immediately restore platform access and subscription capabilities for all organization members."}
            {isDelete &&
              "Are you sure you want to delete this organization workspace? This action is logged in the platform security audit."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              void onConfirm();
            }}
            className={
              isSuspend
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : isDelete
                  ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Processing…
              </>
            ) : isSuspend ? (
              "Suspend Tenant"
            ) : isDelete ? (
              "Delete Organization"
            ) : (
              "Activate Tenant"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
