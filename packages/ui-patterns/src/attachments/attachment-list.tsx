import * as React from "react";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@workforce-erp/ui/components/attachment";
import { Spinner } from "@workforce-erp/ui/components/spinner";

export type AttachmentListItem = {
  id: string;
  name: string;
  description?: React.ReactNode;
  previewUrl?: string;
  state?: "idle" | "uploading" | "processing" | "error" | "done";
  progress?: number;
  media?: React.ReactNode;
  onOpen?: () => void;
  onRemove?: () => void;
  actions?: React.ReactNode;
};

export type AttachmentListProps = {
  items: AttachmentListItem[];
  orientation?: "horizontal" | "vertical";
  emptyMessage?: string;
};

export function AttachmentList({
  items,
  orientation = "horizontal",
  emptyMessage = "No attachments",
}: AttachmentListProps) {
  if (!items.length)
    return (
      <div className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  return (
    <AttachmentGroup
      className={orientation === "vertical" ? "flex-col overflow-visible" : undefined}
    >
      {items.map((item) => (
        <Attachment
          key={item.id}
          state={item.state ?? "done"}
          orientation={orientation}
          className={orientation === "horizontal" ? "w-full" : undefined}
        >
          <AttachmentMedia variant={item.previewUrl ? "image" : "icon"}>
            {item.state === "uploading" || item.state === "processing" ? (
              <Spinner />
            ) : item.previewUrl ? (
              <img src={item.previewUrl} alt="" />
            ) : (
              (item.media ?? <span aria-hidden="true">↗</span>)
            )}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{item.name}</AttachmentTitle>
            <AttachmentDescription>
              {item.state === "uploading" && typeof item.progress === "number"
                ? `${item.progress}% uploaded`
                : item.description}
            </AttachmentDescription>
          </AttachmentContent>
          {item.onOpen ? (
            <AttachmentTrigger aria-label={`Open ${item.name}`} onClick={item.onOpen} />
          ) : null}
          {item.actions || item.onRemove ? (
            <AttachmentActions>
              {item.actions}
              {item.onRemove ? (
                <AttachmentAction aria-label={`Remove ${item.name}`} onClick={item.onRemove}>
                  ×
                </AttachmentAction>
              ) : null}
            </AttachmentActions>
          ) : null}
        </Attachment>
      ))}
    </AttachmentGroup>
  );
}
