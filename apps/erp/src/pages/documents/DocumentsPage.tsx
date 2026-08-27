import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Eye, Trash2, Upload } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { toast } from "sonner";
import {
  apiDelete,
  apiGetPaginated,
  downloadFile,
  errorMessage,
  formatDate,
} from "#features/erp-core/api";
import type { DocumentRecord } from "#features/erp-core/types";
import { DataTable, EmptyPanel, ErpPage, ErrorState, LoadingState } from "#components/erp/ErpPage";
import { companyRoutes } from "#routes/paths";
export default function DocumentLibraryPage() {
  const { tenantKey = "", companyKey = "" } = useParams();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["documents", tenantKey, companyKey],
    queryFn: () => apiGetPaginated<DocumentRecord>("/api/v1/documents", { per_page: 100 }),
  });
  const rm = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/v1/documents/${id}`),
    onSuccess: () => {
      toast.success("Document deleted");
      void qc.invalidateQueries({ queryKey: ["documents", tenantKey, companyKey] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <ErpPage
      title="Documents"
      description="Secure company document library backed by the ERP API."
      actions={
        <Button
          nativeButton={false}
          render={<Link to={companyRoutes.documentUpload(tenantKey, companyKey)} />}
        >
          <Upload />
          Upload document
        </Button>
      }
    >
      {q.isLoading ? (
        <LoadingState />
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : !q.data?.items.length ? (
        <EmptyPanel
          title="No documents"
          description="Upload policies, forms, spreadsheets or other company files."
        />
      ) : (
        <DataTable
          columns={["Document", "Category", "Size", "Uploaded by", "Date", "Actions"]}
          rows={q.data.items.map((d) => [
            <div>
              <p className="font-medium">{d.name}</p>
              <p className="text-xs text-muted-foreground">
                {d.mime_type || "File"} · v{d.version}
              </p>
            </div>,
            <span className="capitalize">{d.category}</span>,
            d.size_label,
            d.uploader?.name || "—",
            formatDate(d.created_at),
            <div className="flex gap-1">
              <Button
                size="icon-sm"
                variant="ghost"
                nativeButton={false}
                render={<Link to={companyRoutes.documentDetails(tenantKey, companyKey, d.id)} />}
              >
                <Eye />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() =>
                  void downloadFile(d.download_url, d.name).catch((e) =>
                    toast.error(errorMessage(e)),
                  )
                }
              >
                <Download />
              </Button>
              <Button
                size="icon-sm"
                variant="destructive"
                onClick={() => {
                  if (confirm("Delete this document?")) rm.mutate(d.id);
                }}
              >
                <Trash2 />
              </Button>
            </div>,
          ])}
          rowKeys={q.data.items.map((document) => document.id)}
        />
      )}
    </ErpPage>
  );
}
