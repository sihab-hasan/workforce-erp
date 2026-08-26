import * as React from "react";
import { Badge } from "@workforce-erp/ui/components/badge";
import { Button } from "@workforce-erp/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workforce-erp/ui/components/dropdown-menu";
import { Input } from "@workforce-erp/ui/components/input";
import { cn } from "@workforce-erp/ui";
import type { EntityPickerOption } from "./entity-picker";

export type MultiEntityPickerProps = {
  options: EntityPickerOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  maxVisible?: number;
  disabled?: boolean;
  className?: string;
};

export function MultiEntityPicker({
  options,
  value,
  onValueChange,
  placeholder = "Select items",
  searchPlaceholder = "Search…",
  maxVisible = 2,
  disabled,
  className,
}: MultiEntityPickerProps) {
  const [query, setQuery] = React.useState("");
  const selected = options.filter((option) => value.includes(option.id));
  const filtered = options.filter((option) =>
    `${option.label} ${option.description ?? ""}`
      .toLocaleLowerCase()
      .includes(query.toLocaleLowerCase()),
  );
  const toggle = (id: string, checked: boolean) =>
    onValueChange(checked ? [...new Set([...value, id])] : value.filter((item) => item !== id));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            disabled={disabled}
            className={cn("h-auto min-h-9 w-full justify-start px-3 py-1.5", className)}
          />
        }
      >
        <span className="flex min-w-0 flex-1 flex-wrap gap-1.5 text-left">
          {selected.length ? (
            <>
              {selected.slice(0, maxVisible).map((option) => (
                <Badge key={option.id} variant="secondary" className="max-w-40 truncate">
                  {option.label}
                </Badge>
              ))}
              {selected.length > maxVisible ? (
                <Badge variant="secondary">+{selected.length - maxVisible}</Badge>
              ) : null}
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[min(24rem,calc(100vw-2rem))]">
        <DropdownMenuLabel>{placeholder}</DropdownMenuLabel>
        <div className="px-1.5 pb-1.5">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          {filtered.length ? (
            filtered.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.id}
                checked={value.includes(option.id)}
                disabled={option.disabled}
                onCheckedChange={(checked) => toggle(option.id, checked === true)}
              >
                <span className="min-w-0">
                  <span className="block truncate">{option.label}</span>
                  {option.description ? (
                    <span className="block truncate text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  ) : null}
                </span>
              </DropdownMenuCheckboxItem>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">No matching items.</div>
          )}
        </div>
        {value.length ? (
          <>
            <DropdownMenuSeparator />
            <button
              type="button"
              className="w-full rounded-xl px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => onValueChange([])}
            >
              Clear selection
            </button>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
