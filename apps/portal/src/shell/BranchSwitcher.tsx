type BranchSwitcherProps = {
  branchName: string
}

export function BranchSwitcher({ branchName }: BranchSwitcherProps) {
  return (
    <div className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
      Branch: {branchName}
    </div>
  )
}
