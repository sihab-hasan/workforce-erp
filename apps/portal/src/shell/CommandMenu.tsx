type CommandMenuProps = {
  hint: string
}

export function CommandMenu({ hint }: CommandMenuProps) {
  return (
    <button
      className="flex min-w-48 items-center justify-between rounded-2xl border border-border bg-muted/50 px-4 py-2 text-left text-sm text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
      type="button"
    >
      <span>{hint}</span>
      <kbd className="rounded-lg border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
        /
      </kbd>
    </button>
  )
}
