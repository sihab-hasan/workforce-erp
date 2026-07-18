const breakdown = [
  { label: "Present",  count: 198, total: 248, color: "bg-emerald-500", light: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-400" },
  { label: "Late",     count: 16,  total: 248, color: "bg-amber-400",   light: "bg-amber-100 dark:bg-amber-950",   text: "text-amber-700 dark:text-amber-400" },
  { label: "Absent",   count: 22,  total: 248, color: "bg-rose-500",    light: "bg-rose-100 dark:bg-rose-950",     text: "text-rose-700 dark:text-rose-400" },
  { label: "On Leave", count: 12,  total: 248, color: "bg-violet-500",  light: "bg-violet-100 dark:bg-violet-950", text: "text-violet-700 dark:text-violet-400" },
]

export interface AttendanceSummaryProps {
  className?: string
}

export function AttendanceSummary({ className }: AttendanceSummaryProps) {
  return (
    <section className={className}>
      <div className="rounded-2xl border border-slate-200/60 bg-white dark:border-slate-800/60 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Today's Attendance
          </h2>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            Out of 248 total employees
          </p>
        </div>

        <div className="space-y-4 px-5 py-4">
          {breakdown.map((item) => {
            const pct = Math.round((item.count / item.total) * 100)
            return (
              <div key={item.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${item.light} ${item.text}`}>
                      {item.count}
                    </span>
                    <span className="text-xs text-slate-400">{pct}%</span>
                  </div>
                </div>
                {/* animated progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-700 ease-out`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Overall presence rate
          </p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            94.2%
          </p>
        </div>
      </div>
    </section>
  )
}

