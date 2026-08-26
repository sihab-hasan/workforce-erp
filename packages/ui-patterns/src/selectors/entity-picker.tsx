import { Avatar, AvatarFallback, AvatarImage } from "@workforce-erp/ui/components/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workforce-erp/ui/components/select";
import { cn } from "@workforce-erp/ui";

export type EntityPickerOption = {
  id: string;
  label: string;
  description?: string;
  avatarUrl?: string;
  initials?: string;
  disabled?: boolean;
};

export type EntityPickerProps = {
  options: EntityPickerOption[];
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
};

function OptionIdentity({ option }: { option: EntityPickerOption }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar className="size-6 shrink-0">
        {option.avatarUrl ? <AvatarImage src={option.avatarUrl} alt="" /> : null}
        <AvatarFallback className="text-[10px]">
          {option.initials ?? option.label.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0">
        <span className="block truncate">{option.label}</span>
        {option.description ? (
          <span className="block truncate text-xs font-normal text-muted-foreground">
            {option.description}
          </span>
        ) : null}
      </span>
    </span>
  );
}

export function EntityPicker({
  options,
  value,
  onValueChange,
  placeholder = "Select an item",
  disabled,
  className,
  ariaLabel = "Select entity",
}: EntityPickerProps) {
  const selected = options.find((option) => option.id === value);
  return (
    <Select value={value ?? null} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger aria-label={ariaLabel} className={cn("w-full", className)}>
        <SelectValue>{selected ? <OptionIdentity option={selected} /> : placeholder}</SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} className="min-w-[var(--anchor-width)]">
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id} disabled={option.disabled}>
            <OptionIdentity option={option} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
