import { UserPlus, CalendarCheck, Clock, FileText, AlertCircle } from "lucide-react"

type ActivityType = "hire" | "leave" | "attendance" | "document" | "alert"

interface ActivityItem {
  id: string
  type: ActivityType
  message: string
  actor: string
  initials: string
  time: string
}

const activities: ActivityItem[] = [
  {
    id: "1",
    type: "hire",
    message: "New employee onboarded",
    actor: "Sarah Mitchell",
    initials: "SM",
    time: "2 hours ago",
  },
  {
    id: "2",
    type: "leave",
    message: "Leave request approved",
    actor: "James Okonkwo",
    initials: "JO",
    time: "4 hours ago",
  },
  {
    id: "3",
    type: "attendance",
    message: "Late check-in flagged",
    actor: "Priya Sharma",
    initials: "PS",
    time: "5 hours ago",
  },
  {
    id: "4",
    type: "document",
    message: "Contract document uploaded",
    actor: "Carlos Mendez",
    initials: "CM",
    time: "Yesterday",
  },
  {
    id: "5",
    type: "alert",
    message: "Probation period ending soon",
    actor: "Lena Fischer",
    initials: "LF",
    time: "Yesterday",
  },
]

const typeConfig: Record<ActivityType, { icon: React.ElementType; bg: string; color: string }> = {
  hire:       { icon: UserPlus,      bg: "bg-indigo-100 dark:bg-indigo-950", color: "text-indigo-600 dark:text-indigo-400" },
  leave:      { icon: CalendarCheck, bg: "bg-emerald-100 dark:bg-emerald-950", color: "text-emerald-600 dark:text-emerald-400" },
  attendance: { icon: Clock,         bg: "bg-amber-100 dark:bg-amber-950",   color: "text-amber-600 dark:text-amber-400" },
  document:   { icon: FileText,      bg: "bg-violet-100 dark:bg-violet-950", color: "text-violet-600 dark:text-violet-400" },
  alert:      { icon: AlertCircle,   bg: "bg-rose-100 dark:bg-rose-950",     color: "text-rose-500 dark:text-rose-400" },
}

export interface ActivityFeedProps {
  className?: string
}

export function ActivityFeed({ className }: ActivityFeedProps) {
  return (
    <section className={className}>
      <div className="rounded-2xl border border-slate-200/60 bg-white dark:border-slate-800/60 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Recent Activity
          </h2>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            Latest events across the platform
          </p>
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {activities.map((item) => {
            const cfg = typeConfig[item.type]
            const Icon = cfg.icon
            return (
              <li key={item.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                  <Icon className={`size-3.5 ${cfg.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {item.message}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {item.actor}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                  {item.time}
                </span>
              </li>
            )
          })}
        </ul>
        <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
          <button
            type="button"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            View all activity →
          </button>
        </div>
      </div>
    </section>
  )
}

