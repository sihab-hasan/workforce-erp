import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workforce-erp/ui/components/dialog";
import { Input } from "@workforce-erp/ui/components/input";

export type SearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (query: string) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  placeholder?: string;
};

export function SearchDialog({
  open,
  onOpenChange,
  query,
  onQueryChange,
  title = "Search",
  description = "Find records, pages, and actions across the workspace.",
  children,
  footer,
  placeholder = "Type to search…",
}: SearchDialogProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-[12vh] max-w-2xl translate-y-0 overflow-hidden p-0"
        initialFocus={inputRef}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="border-b p-3">
          <Input
            ref={inputRef}
            type="search"
            autoComplete="off"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            className="h-11 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-[60vh] min-h-56 overflow-y-auto p-2">{children}</div>
        {footer ? (
          <div className="border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
