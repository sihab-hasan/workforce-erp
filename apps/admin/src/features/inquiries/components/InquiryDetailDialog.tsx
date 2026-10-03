import { useState } from "react";
import {
  Building2,
  CheckCircle,
  Clock,
  Globe,
  Mail,
  MessageSquare,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Badge } from "@workforce-erp/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workforce-erp/ui/components/dialog";
import type { ContactInquiryItem, InquiryStatus } from "../types/inquiries.types";

interface InquiryDetailDialogProps {
  inquiry: ContactInquiryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (id: string | number, status: InquiryStatus) => Promise<void>;
  onDelete: (id: string | number) => Promise<void>;
}

export function InquiryDetailDialog({
  inquiry,
  open,
  onOpenChange,
  onUpdateStatus,
  onDelete,
}: InquiryDetailDialogProps) {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!inquiry) return null;

  const handleStatusChange = async (status: InquiryStatus) => {
    setUpdating(true);
    try {
      await onUpdateStatus(inquiry.id, status);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this contact inquiry?")) return;
    setDeleting(true);
    try {
      await onDelete(inquiry.id);
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  };

  const mailtoUrl = `mailto:${inquiry.email}?subject=${encodeURIComponent(
    `Re: Workforce ERP Inquiry - ${inquiry.company_name || inquiry.first_name}`,
  )}&body=${encodeURIComponent(
    `Hi ${inquiry.first_name},\n\nThank you for reaching out to Workforce ERP.\n\nRegarding your inquiry:\n"${inquiry.message}"\n\nBest regards,\nWorkforce ERP Platform Team`,
  )}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:p-6">
        <DialogHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold sm:text-lg">
                  Inquiry from {inquiry.first_name} {inquiry.last_name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Received on {new Date(inquiry.created_at).toLocaleString()}
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className={
                inquiry.status === "new"
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-600 font-semibold"
                  : inquiry.status === "responded"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 font-semibold"
                    : inquiry.status === "read"
                      ? "border-blue-500/40 bg-blue-500/10 text-blue-600 font-semibold"
                      : "border-border bg-muted text-muted-foreground font-semibold"
              }
            >
              {inquiry.status.toUpperCase()}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 sm:grid-cols-2">
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <User className="size-4 shrink-0 text-primary" />
              <span className="truncate">
                <span className="font-semibold text-foreground">Name:</span> {inquiry.first_name}{" "}
                {inquiry.last_name}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Mail className="size-4 shrink-0 text-primary" />
              <span className="truncate">
                <span className="font-semibold text-foreground">Email:</span>{" "}
                <a
                  href={`mailto:${inquiry.email}`}
                  className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  {inquiry.email}
                </a>
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Building2 className="size-4 shrink-0 text-primary" />
              <span className="truncate">
                <span className="font-semibold text-foreground">Company:</span>{" "}
                {inquiry.company_name || "Not specified"}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Globe className="size-4 shrink-0 text-primary" />
              <span className="truncate">
                <span className="font-semibold text-foreground">IP Address:</span>{" "}
                {inquiry.ip_address || "Unknown"}
              </span>
            </div>
          </div>

          {/* Message Content */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Customer Message
            </span>
            <div className="min-h-32 rounded-xl border border-border/80 bg-card p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap shadow-inner">
              {inquiry.message}
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground px-1">
            <span className="flex items-center gap-1">
              <Clock className="size-3" /> Submitted:{" "}
              {new Date(inquiry.created_at).toLocaleString()}
            </span>
            {inquiry.responded_at && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="size-3" /> Responded:{" "}
                {new Date(inquiry.responded_at).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="gap-1.5"
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              render={
                <a href={mailtoUrl} target="_blank" rel="noopener noreferrer">
                  <Send className="size-3.5" />
                  Reply via Email
                </a>
              }
            />

            {inquiry.status !== "responded" && (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleStatusChange("responded")}
                disabled={updating}
                className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <CheckCircle className="size-3.5" />
                Mark as Responded
              </Button>
            )}

            {inquiry.status !== "archived" ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleStatusChange("archived")}
                disabled={updating}
              >
                Archive
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("read")}
                disabled={updating}
              >
                Unarchive
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
