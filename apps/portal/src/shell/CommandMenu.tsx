import { Search } from "lucide-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workforce-erp/ui/components/input-group"

type CommandMenuProps = {
  hint: string
}

export function CommandMenu({ hint }: CommandMenuProps) {
  return (
    <InputGroup className="min-w-56 rounded-lg border-border bg-card shadow-sm">
      <InputGroupAddon align="inline-start" className="text-muted-foreground">
        <Search aria-hidden />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        placeholder={hint}
        aria-label="Search"
        className="text-sm placeholder:text-muted-foreground"
      />
      <InputGroupAddon align="inline-end">
        <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px] leading-none font-medium text-muted-foreground">
          /
        </kbd>
      </InputGroupAddon>
    </InputGroup>
  )
}
