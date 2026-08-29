import { useState } from "react";
import { CheckCircle2, Clock, FileText, MoreHorizontal, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workforce-erp/ui/components/table";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Button } from "@workforce-erp/ui/components/button";
import { Avatar, AvatarFallback } from "@workforce-erp/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workforce-erp/ui/components/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workforce-erp/ui/components/dialog";
import { Textarea } from "@workforce-erp/ui/components/textarea";

export interface LeaveRequest {
  id: string;
  employee_name: string;
  employee_initials: string;
  department: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  submitted_at: string;
}

export interface LeaveTableProps {
  requests?: LeaveRequest[];
  isManager?: boolean;
  onApprove?: (id: string, remarks?: string) => void;
  onReject?: (id: string, reason: string) => void;
  className?: string;
}

const DEFAULT_REQUESTS: LeaveRequest[] = [
  {
    id: "LR-101",
    employee_name: "Jane Cooper",
    employee_initials: "JC",
    department: "Sales & Marketing",
    leave_type: "Annual Leave",
    start_date: "2026-09-01",
    end_date: "2026-09-03",
    days: 3,
    reason: "Family travel and personal commitment",
    status: "pending",
    submitted_at: "2026-08-25",
  },
  {
    id: "LR-102",
    employee_name: "Devon Lane",
    employee_initials: "DL",
    department: "Engineering",
    leave_type: "Sick Leave",
    start_date: "2026-08-20",
    end_date: "2026-08-21",
    days: 2,
    reason: "Severe flu and medical recovery",
    status: "approved",
    submitted_at: "2026-08-19",
  },
  {
    id: "LR-103",
    employee_name: "Courtney Henry",
    employee_initials: "CH",
    department: "Finance & Accounting",
    leave_type: "Casual Leave",
    start_date: "2026-08-10",
    end_date: "2026-08-10",
    days: 1,
    reason: "Personal banking appointments",
    status: "approved",
    submitted_at: "2026-08-08",
  },
  {
    id: "LR-104",
    employee_name: "Robert Fox",
    employee_initials: "RF",
    department: "Operations",
    leave_type: "Annual Leave",
    start_date: "2026-07-15",
    end_date: "2026-07-22",
    days: 6,
    reason: "Summer holiday trip",
    status: "rejected",
    submitted_at: "2026-07-10",
  },
];

function statusBadge(status: LeaveRequest["status"]) {
  switch (status) {
    case "approved":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400"
        >
          <CheckCircle2 className="mr-1 size-3" /> Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="outline"
          className="bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400"
        >
          <XCircle className="mr-1 size-3" /> Rejected
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400"
        >
          <Clock className="mr-1 size-3" /> Pending Review
        </Badge>
      );
  }
}

export function LeaveTable({
  requests = DEFAULT_REQUESTS,
  isManager = true,
  onApprove,
  onReject,
  className,
}: LeaveTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [rejectDialog, setRejectDialog] = useState<LeaveRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleConfirmReject = () => {
    if (!rejectDialog || !rejectReason.trim()) return;
    onReject?.(rejectDialog.id, rejectReason);
    setRejectDialog(null);
    setRejectReason("");
  };

  return (
    <div className={className}>
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Dates & Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No leave requests found in this period.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 rounded-lg text-xs">
                        <AvatarFallback className="bg-primary/10 font-bold text-primary">
                          {req.employee_initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm text-foreground">{req.employee_name}</p>
                        <p className="text-xs text-muted-foreground">{req.department}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="font-medium text-sm">{req.leave_type}</span>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">
                        {req.start_date === req.end_date
                          ? req.start_date
                          : `${req.start_date} → ${req.end_date}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {req.days} {req.days === 1 ? "day" : "days"}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>{statusBadge(req.status)}</TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {req.submitted_at}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Leave Action</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedRequest(req)}>
                          <FileText className="mr-2 size-4" /> View Details
                        </DropdownMenuItem>
                        {isManager && req.status === "pending" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onApprove?.(req.id)}
                              className="text-emerald-600 focus:text-emerald-600"
                            >
                              <CheckCircle2 className="mr-2 size-4" /> Approve Leave
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setRejectDialog(req)}
                              className="text-destructive focus:text-destructive"
                            >
                              <XCircle className="mr-2 size-4" /> Reject Leave
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog
        open={Boolean(selectedRequest)}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              Review leave submission parameters and employee justification
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 text-sm py-2">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-muted-foreground">Applicant</span>
                <span className="font-semibold">
                  {selectedRequest.employee_name} ({selectedRequest.department})
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{selectedRequest.leave_type}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-muted-foreground">Period</span>
                <span className="font-medium">
                  {selectedRequest.start_date} to {selectedRequest.end_date} ({selectedRequest.days}{" "}
                  days)
                </span>
              </div>
              <div className="space-y-1.5 border-b pb-3">
                <span className="text-muted-foreground">Reason</span>
                <p className="rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-foreground">
                  {selectedRequest.reason}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Status</span>
                <span>{statusBadge(selectedRequest.status)}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={Boolean(rejectDialog)} onOpenChange={(open) => !open && setRejectDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this request. The employee will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="e.g. Critical project deadline / insufficient team coverage…"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={!rejectReason.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
