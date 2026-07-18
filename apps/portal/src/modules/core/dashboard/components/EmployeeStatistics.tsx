const departments = [
  { name: "Engineering",  count: 52, color: "bg-indigo-500" },
  { name: "Operations",   count: 44, color: "bg-violet-500" },
  { name: "Sales",        count: 38, color: "bg-emerald-500" },
  { name: "HR & Admin",   count: 27, color: "bg-amber-400" },
  { name: "Finance",      count: 21, color: "bg-rose-500" },
  { name: "Marketing",    count: 18, color: "bg-cyan-500" },
  { name: "Others",       count: 48, color: "bg-slate-400" },
]

const total = departments.reduce((sum, d) => sum + d.count, 0)

export interface EmployeeStatisticsProps {
  className?: string
}

export function EmployeeStatistics({ className }: EmployeeStatisticsProps) {
  return (
    <section className={className}>
      <div className="rounded-2xl border border-slate-200/60 bg-white dark:border-slate-800/60 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Employees by Department
          </h2>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            {total} total across {departments.length} departments
          </p>
        </div>

        {/* stacked bar at top */}
        <div className="flex h-2 overflow-hidden rounded-none">
          {departments.map((dept) => (
            <div
              key={dept.name}
              className={`${dept.color} transition-all duration-700`}
              style={{ width: `${(dept.count / total) * 100}%` }}
            />
          ))}
        </div>

        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {departments.map((dept) => {
            const pct = Math.round((dept.count / total) * 100)
            return (
              <li
                key={dept.name}
                className="flex items-center gap-3 px-5 py-2.5"
              >
                <span className={`size-2 shrink-0 rounded-full ${dept.color}`} />
                <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                  {dept.name}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {pct}%
                </span>
                <span className="w-8 text-right text-sm font-semibold text-slate-900 dark:text-white">
                  {dept.count}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

