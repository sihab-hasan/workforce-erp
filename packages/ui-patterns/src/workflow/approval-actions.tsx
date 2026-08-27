import * as React from "react";
import { Button } from "@workforce-erp/ui/components/button";
import { Textarea } from "@workforce-erp/ui/components/textarea";
import { cn } from "@workforce-erp/ui";

export type ApprovalActionsProps = React.ComponentProps<"div"> & {
  onApprove?: () => void;
  onReject?: () => void;
  onRequestChanges?: () => void;
  onDelegate?: () => void;
  approveLabel?: string;
  rejectLabel?: string;
  pending?: boolean;
  disabled?: boolean;
  comment?: string;
  onCommentChange?: (value: string) => void;
  commentPlaceholder?: string;
  requireComment?: boolean;
};

export function ApprovalActions({
  onApprove,
  onReject,
  onRequestChanges,
  onDelegate,
  approveLabel = "Approve",
  rejectLabel = "Reject",
  pending,
  disabled,
  comment,
  onCommentChange,
  commentPlaceholder = "Add a note for the requester…",
  requireComment,
  className,
  ...props
}: ApprovalActionsProps) {
  const commentMissing = requireComment && !comment?.trim();
  return (
    <div className={cn("space-y-3 rounded-2xl border bg-card p-4", className)} {...props}>
      {onCommentChange ? (
        <Textarea
          value={comment ?? ""}
          onChange={(event) => onCommentChange(event.target.value)}
          placeholder={commentPlaceholder}
          className="min-h-20"
        />
      ) : null}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {onDelegate ? (
          <Button variant="ghost" onClick={onDelegate} disabled={pending || disabled}>
            Delegate
          </Button>
        ) : null}
        {onRequestChanges ? (
          <Button
            variant="outline"
            onClick={onRequestChanges}
            disabled={pending || disabled || commentMissing}
          >
            Request changes
          </Button>
        ) : null}
        {onReject ? (
          <Button
            variant="destructive"
            onClick={onReject}
            disabled={pending || disabled || commentMissing}
          >
            {rejectLabel}
          </Button>
        ) : null}
        {onApprove ? (
          <Button onClick={onApprove} disabled={pending || disabled}>
            {pending ? "Working…" : approveLabel}
          </Button>
        ) : null}
      </div>
      {commentMissing ? (
        <p className="text-right text-xs text-destructive">
          A comment is required for this action.
        </p>
      ) : null}
    </div>
  );
}
