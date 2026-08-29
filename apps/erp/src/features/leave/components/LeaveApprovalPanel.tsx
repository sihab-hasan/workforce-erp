import { useState } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Textarea } from "@workforce-erp/ui/components/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";

// ─── Inline WorkflowTimeline ───────────────────────────────────────────────
interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: string;
  tone: "success" | "warning" | "danger" | "neutral";
  timestamp?: string;
  current?: boolean;
}

function WorkflowTimeline({ steps }: { steps: TimelineStep[] }) {
  const toneClasses: Record<TimelineStep["tone"], string> = {
    success: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400",
    danger: "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400",
    neutral: "bg-muted text-muted-foreground border-border",
  };

  const toneIcon: Record<TimelineStep["tone"], React.ReactNode> = {
    success: <CheckCircle2 className="size-4" />,
    warning: <Clock className="size-4" />,
    danger: <XCircle className="size-4" />,
    neutral: <Clock className="size-4" />,
  };

  return (
    <ol className="space-y-3">
      {steps.map((step, idx) => (
        <li key={step.id} className="flex gap-3">
          {/* Connector line */}
          <div className="flex flex-col items-center">
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full border ${toneClasses[step.tone]} ${step.current ? "ring-2 ring-primary/30 ring-offset-1" : ""}`}
            >
              {toneIcon[step.tone]}
            </span>
            {idx < steps.length - 1 && (
              <div className="mt-1 h-full w-px bg-border" />
            )}
          </div>

          {/* Content */}
          <div className="pb-4 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground leading-tight">{step.title}</p>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${toneClasses[step.tone]}`}
              >
                {step.status}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
            {step.timestamp && (
              <p className="mt-0.5 text-[10px] text-muted-foreground/60">{step.timestamp}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

// ─── Inline ApprovalActions ───────────────────────────────────────────────
interface ApprovalActionsProps {
  comment: string;
  onCommentChange: (val: string) => void;
  pending: boolean;
  onApprove: () => void;
  onReject: () => void;
  approveLabel?: string;
  rejectLabel?: string;
  commentPlaceholder?: string;
}

function ApprovalActions({
  comment,
  onCommentChange,
  pending,
  onApprove,
  onReject,
  approveLabel = "Approve",
  rejectLabel = "Reject",
  commentPlaceholder = "Add optional remarks…",
}: ApprovalActionsProps) {
  return (
    <div className="space-y-3">
      <Textarea
        rows={3}
        placeholder={commentPlaceholder}
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        disabled={pending}
      />
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          className="text-destructive border-destructive/40 hover:bg-destructive/10"
          onClick={onReject}
          disabled={pending}
        >
          <XCircle className="mr-2 size-4" />
          {rejectLabel}
        </Button>
        <Button
          type="button"
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={onApprove}
          disabled={pending}
        >
          <CheckCircle2 className="mr-2 size-4" />
          {approveLabel}
        </Button>
      </div>
    </div>
  );
}

// ─── LeaveApprovalPanel ───────────────────────────────────────────────────
export interface LeaveApprovalPanelProps {
  requestId: string;
  applicantName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  isPending?: boolean;
  onApprove?: (remarks: string) => void;
  onReject?: (remarks: string) => void;
  className?: string;
}

export function LeaveApprovalPanel({
  requestId,
  applicantName,
  leaveType,
  startDate,
  endDate,
  totalDays,
  reason,
  status,
  isPending = false,
  onApprove,
  onReject,
  className,
}: LeaveApprovalPanelProps) {
  const [remarks, setRemarks] = useState("");

  const timelineSteps: TimelineStep[] = [
    {
      id: "submitted",
      title: "Leave Application Submitted",
      description: `${applicantName} requested ${totalDays} days of ${leaveType}`,
      status: "Submitted",
      tone: "success",
      timestamp: "Step 1",
    },
    {
      id: "manager-approval",
      title: "Line Manager Review",
      description: status === "pending" ? "Awaiting decision" : `Marked as ${status}`,
      status: status === "pending" ? "Pending" : status === "approved" ? "Approved" : "Rejected",
      tone:
        status === "pending"
          ? "warning"
          : status === "approved"
            ? "success"
            : "danger",
      current: status === "pending",
    },
    {
      id: "hr-processing",
      title: "HR Balance Deduction & Calendar Sync",
      description:
        status === "approved"
          ? "Processed into payroll & leave balances"
          : "Pending prior approvals",
      status: status === "approved" ? "Completed" : "Queued",
      tone: status === "approved" ? "success" : "neutral",
    },
  ];

  return (
    <div className={`space-y-6 ${className ?? ""}`}>
      <Card className="rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle>Leave Application #{requestId}</CardTitle>
          <CardDescription>
            {applicantName} · {leaveType} ({startDate} to {endDate}, {totalDays}{" "}
            {totalDays === 1 ? "day" : "days"})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/40 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reason Provided
            </p>
            <p className="mt-1 text-foreground">{reason || "No explicit reason specified."}</p>
          </div>

          <div className="pt-2">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Workflow Status Trail
            </p>
            <WorkflowTimeline steps={timelineSteps} />
          </div>

          {status === "pending" && (
            <div className="pt-4 border-t">
              <ApprovalActions
                comment={remarks}
                onCommentChange={setRemarks}
                pending={isPending}
                onApprove={() => onApprove?.(remarks)}
                onReject={() => onReject?.(remarks)}
                approveLabel="Approve Leave"
                rejectLabel="Reject Leave"
                commentPlaceholder="Optional remarks for the applicant…"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
