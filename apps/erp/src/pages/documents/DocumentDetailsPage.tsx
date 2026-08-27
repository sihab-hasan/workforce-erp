import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { toast } from "sonner";
import {
  apiDelete,
  apiGet,
  downloadFile,
  errorMessage,
  formatDateTime,
} from "#features/erp-core/api";
import type { DocumentRecord } from "#features/erp-core/types";
import { ErpPage, ErrorState, LoadingState, SectionCard, StatCard } from "#components/erp/ErpPage";
import { companyRoutes } from "#routes/paths";
export default function DocumentDetailsPage() {
  const { tenantKey = "", companyKey = "", documentId = "" } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["document", tenantKey, companyKey, documentId],
    queryFn: () => apiGet<DocumentRecord>(`/api/v1/documents/${documentId}`),
  });
  const rm = useMutation({
    mutationFn: () => apiDelete(`/api/v1/documents/${documentId}`),
    onSuccess: () => {
      toast.success("Document deleted");
      void qc.invalidateQueries({ queryKey: ["documents", tenantKey, companyKey] });
      nav(companyRoutes.documents(tenantKey, companyKey));
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  if (q.isLoading) return <LoadingState />;
  if (q.isError || !q.data)
    return <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />;
  const d = q.data;
  return (
    <ErpPage
      title={d.name}
      description="Document metadata and secure download."
      actions={
        <>
          <Button
            onClick={() =>
              void downloadFile(d.download_url, d.name).catch((e) => toast.error(errorMessage(e)))
            }
          >
            <Download />
            Download
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("Delete this document?")) rm.mutate();
            }}
          >
            <Trash2 />
            Delete
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Category"
          value={<span className="text-base capitalize">{d.category}</span>}
        />
        <StatCard label="Size" value={d.size_label} />
        <StatCard label="Version" value={`v${d.version}`} />
      </div>
      <SectionCard title="Document information">
        <dl className="grid gap-5 sm:grid-cols-2">
          <Info label="MIME type" value={d.mime_type} />
          <Info label="Uploaded by" value={d.uploader?.name} />
          <Info label="Uploaded at" value={formatDateTime(d.created_at)} />
          <Info label="Updated at" value={formatDateTime(d.updated_at)} />
        </dl>
        {d.description ? (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Description</p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{d.description}</p>
          </div>
        ) : null}
      </SectionCard>
    </ErpPage>
  );
}
function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value || "—"}</dd>
    </div>
  );
}
