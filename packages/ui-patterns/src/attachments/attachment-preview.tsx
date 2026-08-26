import * as React from "react";
import { Button } from "@workforce-erp/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workforce-erp/ui/components/dialog";

export type AttachmentPreviewProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  description?: React.ReactNode;
  url?: string;
  mimeType?: string;
  preview?: React.ReactNode;
  onDownload?: () => void;
};

export function AttachmentPreview({
  open,
  onOpenChange,
  name,
  description,
  url,
  mimeType,
  preview,
  onDownload,
}: AttachmentPreviewProps) {
  const isImage =
    mimeType?.startsWith("image/") ||
    (!mimeType && url && /\.(png|jpe?g|gif|webp|svg)$/i.test(url));
  const isPdf =
    mimeType === "application/pdf" || (!mimeType && url?.toLowerCase().endsWith(".pdf"));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl overflow-hidden p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="truncate pr-8">{name}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="flex min-h-[24rem] max-h-[72vh] items-center justify-center overflow-auto bg-muted/25 p-4">
          {preview ??
            (url && isImage ? (
              <img
                src={url}
                alt={name}
                className="max-h-[66vh] max-w-full rounded-lg object-contain shadow-sm"
              />
            ) : url && isPdf ? (
              <iframe
                src={url}
                title={name}
                className="h-[66vh] w-full rounded-lg border bg-background"
              />
            ) : (
              <div className="max-w-md text-center text-sm text-muted-foreground">
                Preview isn't available for this file type.
              </div>
            ))}
        </div>
        <DialogFooter className="border-t px-5 py-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onDownload ? <Button onClick={onDownload}>Download</Button> : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
