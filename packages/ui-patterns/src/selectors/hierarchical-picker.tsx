import * as React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workforce-erp/ui/components/collapsible";
import { cn } from "@workforce-erp/ui";

export type HierarchicalPickerNode = {
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  children?: HierarchicalPickerNode[];
  disabled?: boolean;
};

export type HierarchicalPickerProps = {
  nodes: HierarchicalPickerNode[];
  value?: string | null;
  onValueChange?: (id: string) => void;
  className?: string;
  ariaLabel?: string;
};

function TreeNode({
  node,
  value,
  onValueChange,
  depth,
}: {
  node: HierarchicalPickerNode;
  value: string | null | undefined;
  onValueChange: ((id: string) => void) | undefined;
  depth: number;
}) {
  const hasChildren = Boolean(node.children?.length);
  const selected = value === node.id;
  const row = (
    <button
      type="button"
      role="treeitem"
      aria-selected={selected}
      disabled={node.disabled}
      onClick={() => onValueChange?.(node.id)}
      className={cn(
        "flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50",
        selected && "bg-primary/10 font-medium text-foreground",
      )}
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
      <span className="min-w-0 flex-1">
        <span className="block truncate">{node.label}</span>
        {node.description ? (
          <span className="block truncate text-xs font-normal text-muted-foreground">
            {node.description}
          </span>
        ) : null}
      </span>
    </button>
  );

  if (!hasChildren)
    return (
      <div className="flex" style={{ paddingInlineStart: `${depth * 1.1}rem` }}>
        {row}
      </div>
    );

  return (
    <Collapsible defaultOpen={depth < 1}>
      <div className="flex items-start gap-1" style={{ paddingInlineStart: `${depth * 1.1}rem` }}>
        <CollapsibleTrigger
          className="mt-1.5 flex size-6 shrink-0 items-center justify-center rounded-lg text-xs text-muted-foreground hover:bg-muted"
          aria-label={`Toggle ${String(node.label)}`}
        >
          ›
        </CollapsibleTrigger>
        {row}
      </div>
      <CollapsibleContent role="group" className="mt-1 space-y-1">
        {node.children?.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            value={value}
            onValueChange={onValueChange}
            depth={depth + 1}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function HierarchicalPicker({
  nodes,
  value,
  onValueChange,
  className,
  ariaLabel = "Hierarchy",
}: HierarchicalPickerProps) {
  return (
    <div
      role="tree"
      aria-label={ariaLabel}
      className={cn("max-h-80 space-y-1 overflow-y-auto rounded-2xl border bg-card p-2", className)}
    >
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} value={value} onValueChange={onValueChange} depth={0} />
      ))}
    </div>
  );
}
