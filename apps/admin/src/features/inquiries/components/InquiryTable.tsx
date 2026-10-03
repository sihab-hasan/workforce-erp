import {
  Building2,
  CheckCircle,
  Eye,
  MessageSquare,
  MoreHorizontal,
  Send,
  Trash2,
} from "lucide-react";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Button } from "@workforce-erp/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workforce-erp/ui/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workforce-erp/ui/components/dropdown-menu";
import type { ContactInquiryItem, InquiryStatus } from "../types/inquiries.types";

interface InquiryTableProps {
  inquiries: ContactInquiryItem[];
  loading?: boolean;
  onSelectInquiry: (inquiry: ContactInquiryItem) => void;
  onUpdateStatus: (id: string | number, status: InquiryStatus) => Promise<void>;
  onDelete: (id: string | number) => Promise<void>;
}

export function InquiryTable({
  inquiries,
  loading,
  onSelectInquiry,
  onUpdateStatus,
  onDelete,
}: InquiryTableProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border/70 bg-card p-6 text-center text-sm text-muted-foreground">
        Loading inquiries...
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-card/50 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <MessageSquare className="size-6" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-foreground">No contact inquiries found</h3>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          When visitors submit messages through the web portal contact page, they will appear here
          in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="w-28 text-xs font-semibold uppercase">Status</TableHead>
            <TableHead className="text-xs font-semibold uppercase">Contact / Company</TableHead>
            <TableHead className="min-w-64 text-xs font-semibold uppercase">Message</TableHead>
            <TableHead className="w-40 text-xs font-semibold uppercase">Received</TableHead>
            <TableHead className="w-16 text-right text-xs font-semibold uppercase">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inquiries.map((item) => {
            const isNew = item.status === "new";
            const isResponded = item.status === "responded";
            const isRead = item.status === "read";

            return (
              <TableRow
                key={item.id}
                className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                  isNew ? "bg-primary/5 font-medium" : ""
                }`}
                onClick={() => onSelectInquiry(item)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Badge
                    variant="outline"
                    className={
                      isNew
                        ? "border-rose-500/40 bg-rose-500/10 text-rose-600 font-bold"
                        : isResponded
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 font-semibold"
                          : isRead
                            ? "border-blue-500/40 bg-blue-500/10 text-blue-600 font-medium"
                            : "border-border bg-muted/60 text-muted-foreground font-medium"
                    }
                  >
                    {item.status.toUpperCase()}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">
                      {item.first_name} {item.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.email}</span>
                    {item.company_name && (
                      <span className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-primary">
                        <Building2 className="size-3" /> {item.company_name}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {item.message}
                  </p>
                </TableCell>

                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </TableCell>

                <TableCell onClick={(e) => e.stopPropagation()} className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-xs" aria-label="Inquiry actions">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onSelectInquiry(item)}>
                        <Eye className="mr-2 size-4" /> View Details
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        render={
                          <a
                            href={`mailto:${item.email}?subject=${encodeURIComponent(
                              `Re: Workforce ERP Inquiry - ${item.company_name || item.first_name}`,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Send className="mr-2 size-4" /> Quick Reply
                          </a>
                        }
                      />

                      <DropdownMenuSeparator />

                      {item.status !== "responded" && (
                        <DropdownMenuItem onClick={() => onUpdateStatus(item.id, "responded")}>
                          <CheckCircle className="mr-2 size-4 text-emerald-500" /> Mark Responded
                        </DropdownMenuItem>
                      )}

                      {item.status !== "archived" ? (
                        <DropdownMenuItem onClick={() => onUpdateStatus(item.id, "archived")}>
                          Archive
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onUpdateStatus(item.id, "read")}>
                          Mark as Read
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => {
                          if (confirm("Delete this inquiry permanently?")) {
                            onDelete(item.id);
                          }
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
