import * as React from "react";
import { Button } from "@workforce-erp/ui/components/button";
import { cn } from "@workforce-erp/ui";

export type AttachmentUploaderProps = React.ComponentProps<"div"> & {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  maxFiles?: number;
  maxSizeBytes?: number;
  onFilesSelected: (files: File[]) => void;
  label?: string;
  description?: string;
  compact?: boolean;
};

export function AttachmentUploader({
  accept,
  multiple = true,
  disabled,
  maxFiles,
  maxSizeBytes,
  onFilesSelected,
  label = "Drop files here or browse",
  description,
  compact = false,
  className,
  ...props
}: AttachmentUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const choose = (incoming: FileList | File[]) => {
    let files = Array.from(incoming);
    if (maxSizeBytes) files = files.filter((file) => file.size <= maxSizeBytes);
    if (maxFiles) files = files.slice(0, maxFiles);
    if (!multiple) files = files.slice(0, 1);
    if (files.length) onFilesSelected(files);
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/15 text-center transition-colors",
        compact ? "min-h-28 gap-2 p-4" : "min-h-44 gap-3 p-6",
        dragging && "border-primary bg-primary/5",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        choose(event.dataTransfer.files);
      }}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple={multiple}
        accept={accept}
        disabled={disabled}
        onChange={(event) => {
          if (event.target.files) choose(event.target.files);
          event.currentTarget.value = "";
        }}
      />
      <div
        className="flex size-10 items-center justify-center rounded-full bg-muted text-lg"
        aria-hidden="true"
      >
        ＋
      </div>
      <div>
        <div className="text-sm font-medium">{label}</div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description ??
            [
              accept ? `Accepted: ${accept}` : null,
              maxFiles ? `Up to ${maxFiles} files` : null,
              maxSizeBytes ? `Max ${(maxSizeBytes / 1024 / 1024).toFixed(0)} MB each` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        Choose files
      </Button>
    </div>
  );
}
