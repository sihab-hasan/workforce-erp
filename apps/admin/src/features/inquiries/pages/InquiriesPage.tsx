import { useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { InquiryKpiCards } from "../components/InquiryKpiCards";
import { InquiryTable } from "../components/InquiryTable";
import { InquiryDetailDialog } from "../components/InquiryDetailDialog";
import { useInquiries } from "../hooks/use-inquiries";
import type { ContactInquiryItem, InquiryStatus } from "../types/inquiries.types";

export default function InquiriesPage() {
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiryItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { inquiries, counts, isLoading, isFetching, refetch, updateStatus, deleteInquiry } =
    useInquiries({
      status: statusFilter,
      search: search || undefined,
    });

  const handleSelectInquiry = (inquiry: ContactInquiryItem) => {
    setSelectedInquiry(inquiry);
    setDetailOpen(true);
    if (inquiry.status === "new") {
      void updateStatus(inquiry.id, "read");
    }
  };

  const handleUpdateStatus = async (id: string | number, status: InquiryStatus) => {
    await updateStatus(id, status);
    if (selectedInquiry && String(selectedInquiry.id) === String(id)) {
      setSelectedInquiry((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleDelete = async (id: string | number) => {
    await deleteInquiry(id);
    if (selectedInquiry && String(selectedInquiry.id) === String(id)) {
      setSelectedInquiry(null);
    }
  };

  const tabs: { label: string; value: InquiryStatus | "all"; count?: number }[] = [
    { label: "All Inquiries", value: "all", count: counts.total },
    { label: "New", value: "new", count: counts.new },
    { label: "Read", value: "read", count: counts.read },
    { label: "Responded", value: "responded", count: counts.responded },
    { label: "Archived", value: "archived", count: counts.archived },
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Contact Inquiries
            </h1>
            {counts.new > 0 && (
              <span className="inline-flex items-center rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                {counts.new} New
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Manage incoming messages and sales inquiries submitted via the public portal contact
            form.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <InquiryKpiCards counts={counts} loading={isLoading} />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border/70 bg-card p-1 shadow-xs">
          {tabs.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : tab.value === "new" && tab.count > 0
                          ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative min-w-64 max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, company, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Data Table */}
      <InquiryTable
        inquiries={inquiries}
        loading={isLoading}
        onSelectInquiry={handleSelectInquiry}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDelete}
      />

      {/* Inquiry Detail Dialog */}
      <InquiryDetailDialog
        inquiry={selectedInquiry}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDelete}
      />
    </div>
  );
}
