import { Link } from "react-router-dom"
import { UserPlus, CalendarPlus, ClipboardList, FileSearch, DollarSign, Users } from "lucide-react"

interface QuickAction {
  label: string
  description: string
  to: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
}

const actions: QuickAction[] = [
  {
    label: "Add Employee",
    description: "Onboard a new team member",
    to: "/people/employees",
    icon: UserPlus,
    iconBg: "bg-indigo-100 dark:bg-indigo-950",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    label: "New Leave Request",
    description: "Submit or review time-off",
    to: "/people/leave",
    icon: CalendarPlus,
    iconBg: "bg-emerald-100 dark:bg-emerald-950",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "View Attendance",
    description: "Check today's presence log",
    to: "/people/attendance",
    icon: ClipboardList,
    iconBg: "bg-amber-100 dark:bg-amber-950",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    label: "Review Documents",
    description: "Manage employee files",
    to: "/people/documents",
    icon: FileSearch,
    iconBg: "bg-violet-100 dark:bg-violet-950",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    label: "Payroll Runs",
    description: "Process salary operations",
    to: "/people/payroll",
    icon: DollarSign,
    iconBg: "bg-rose-100 dark:bg-rose-950",
    iconColor: "text-rose-500 dark:text-rose-400",
  },
  {
    label: "Departments",
    description: "Manage org structure",
    to: "/people/departments",
    icon: Users,
    iconBg: "bg-cyan-100 dark:bg-cyan-950",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
]

export interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className }: QuickActionsProps) {
  return (
    <section className={className}>
      <div className="rounded-2xl border border-slate-200/60 bg-white dark:border-slate-800/60 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Quick Actions
          </h2>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            Common tasks at a glance
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800 sm:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.label}
                to={action.to}
                className="group flex flex-col gap-2 bg-white p-4 transition-colors hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60"
              >
                <div className={`flex size-9 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${action.iconBg}`}>
                  <Icon className={`size-4 ${action.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {action.label}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {action.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

