import { Button } from "@workforce-erp/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workforce-erp/ui/components/dropdown-menu";
import type { SavedView } from "./filter.types";

export type SavedViewSelectorProps = {
  views: SavedView[];
  value?: string | null;
  onValueChange?: (id: string) => void;
  onManage?: () => void;
  label?: string;
};

export function SavedViewSelector({
  views,
  value,
  onValueChange,
  onManage,
  label = "View",
}: SavedViewSelectorProps) {
  const selected = views.find((view) => view.id === value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        {selected?.name ?? label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Saved views</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {views.map((view) => (
          <DropdownMenuItem key={view.id} onClick={() => onValueChange?.(view.id)}>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{view.name}</span>
                {view.isDefault ? (
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Default
                  </span>
                ) : null}
              </div>
              {view.description ? (
                <p className="truncate text-xs text-muted-foreground">{view.description}</p>
              ) : null}
            </div>
            {value === view.id ? <span aria-hidden="true">✓</span> : null}
          </DropdownMenuItem>
        ))}
        {onManage ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onManage}>Manage views</DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
