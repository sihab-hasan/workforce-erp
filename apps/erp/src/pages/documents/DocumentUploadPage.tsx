import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@workforce-erp/ui/components/button";
import { Field, Input, NativeSelect, Textarea } from "#components/erp/FormControls";
import { ErpPage, SectionCard } from "#components/erp/ErpPage";
import { apiUpload, errorMessage } from "#features/erp-core/api";
import type { DocumentRecord } from "#features/erp-core/types";
import { companyRoutes } from "#routes/paths";
export default function DocumentUploadPage() {
  const { tenantKey = "", companyKey = "" } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("general");
  const [description, setDescription] = useState("");
  const m = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Choose a file first.");
      const form = new FormData();
      form.append("file", file);
      if (name.trim()) form.append("name", name.trim());
      form.append("category", category);
      if (description.trim()) form.append("description", description.trim());
      return apiUpload<DocumentRecord>("/api/v1/documents", form);
    },
    onSuccess: (d) => {
      toast.success("Document uploaded");
      void qc.invalidateQueries({ queryKey: ["documents", tenantKey, companyKey] });
      nav(companyRoutes.documentDetails(tenantKey, companyKey, d.id));
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <ErpPage
      title="Upload document"
      description="Files are validated by type and limited to 20 MB before storage."
    >
      <SectionCard title="Document">
        <form
          className="grid gap-5 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            m.mutate();
          }}
        >
          <div className="md:col-span-2">
            <Field
              label="File"
              hint="PDF, Office documents, CSV/TXT and common image formats up to 20 MB."
            >
              <Input
                required
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </Field>
          </div>
          <Field label="Display name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={file?.name || "Defaults to file name"}
            />
          </Field>
          <Field label="Category">
            <NativeSelect value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="general">General</option>
              <option value="policy">Policy</option>
              <option value="hr">HR</option>
              <option value="finance">Finance</option>
              <option value="legal">Legal</option>
              <option value="form">Form / template</option>
            </NativeSelect>
          </Field>
          <div className="md:col-span-2">
            <Field label="Description">
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={m.isPending || !file}>
              Upload document
            </Button>
          </div>
        </form>
      </SectionCard>
    </ErpPage>
  );
}
