type BranchSwitcherProps = {
  branchName: string
}

export function BranchSwitcher({ branchName }: BranchSwitcherProps) {
  return (
    <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
      Branch: {branchName}
    </div>
  )
}
