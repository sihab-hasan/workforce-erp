import * as React from "react";
import { Button } from "@workforce-erp/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@workforce-erp/ui/components/input-group";
import { Kbd, KbdGroup } from "@workforce-erp/ui/components/kbd";
import { cn } from "@workforce-erp/ui";

export type GlobalSearchProps = Omit<React.ComponentProps<typeof InputGroup>, "children"> & {
  value?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onOpen?: () => void;
  placeholder?: string;
  shortcut?: string[];
  clearable?: boolean;
};

export function GlobalSearch({
  value = "",
  onValueChange,
  onSubmit,
  onOpen,
  placeholder = "Search employees, documents, actions…",
  shortcut = ["⌘", "K"],
  clearable = true,
  className,
  ...props
}: GlobalSearchProps) {
  return (
    <InputGroup className={cn("max-w-xl bg-background", className)} {...props}>
      <InputGroupAddon align="inline-start">
        <InputGroupText aria-hidden="true">⌕</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onValueChange?.(event.target.value)}
        onFocus={onOpen}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSubmit?.(value);
        }}
      />
      <InputGroupAddon align="inline-end">
        {clearable && value ? (
          <InputGroupButton aria-label="Clear search" onClick={() => onValueChange?.("")}>
            ×
          </InputGroupButton>
        ) : shortcut.length ? (
          <KbdGroup>
            {shortcut.map((key) => (
              <Kbd key={key}>{key}</Kbd>
            ))}
          </KbdGroup>
        ) : onOpen ? (
          <Button size="xs" variant="ghost" onClick={onOpen}>
            Search
          </Button>
        ) : null}
      </InputGroupAddon>
    </InputGroup>
  );
}
