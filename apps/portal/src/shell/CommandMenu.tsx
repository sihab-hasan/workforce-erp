type CommandMenuProps = {
  hint: string
}

export function CommandMenu({ hint }: CommandMenuProps) {
  return (
    <button
      className="hidden min-w-60 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-2 text-left text-sm text-slate-500 shadow-sm md:flex dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
      type="button"
    >
      <span>{hint}</span>
      <span className="rounded-lg border border-slate-200 px-2 py-0.5 text-xs dark:border-slate-700">
        /
      </span>
    </button>
  )
}
