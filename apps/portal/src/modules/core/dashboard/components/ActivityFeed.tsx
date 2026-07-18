import { UserPlus, CalendarCheck, Clock, FileText, AlertCircle } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workforce-erp/ui/components/card"
import {
  Avatar,
  AvatarFallback,
} from "@workforce-erp/ui/components/avatar"
import { Button } from "@workforce-erp/ui/components/button"

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

const typeConfig: Record<ActivityType, { icon: React.ElementType; bg: string; color: string; avatarBg: string }> = {
  hire:       { icon: UserPlus,      bg: "bg-primary/15",       color: "text-primary",       avatarBg: "bg-primary/20 text-primary" },
  leave:      { icon: CalendarCheck, bg: "bg-emerald-500/15",   color: "text-emerald-400",   avatarBg: "bg-emerald-500/20 text-emerald-400" },
  attendance: { icon: Clock,         bg: "bg-amber-500/15",     color: "text-amber-400",     avatarBg: "bg-amber-500/20 text-amber-400" },
  document:   { icon: FileText,      bg: "bg-violet-500/15",    color: "text-violet-400",    avatarBg: "bg-violet-500/20 text-violet-400" },
  alert:      { icon: AlertCircle,   bg: "bg-rose-500/15",      color: "text-rose-400",      avatarBg: "bg-rose-500/20 text-rose-400" },
}

export interface ActivityFeedProps {
  className?: string
}

export function ActivityFeed({ className }: ActivityFeedProps) {
  return (
    <section className={className}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest events across the platform</CardDescription>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          <ul className="divide-y divide-border">
            {activities.map((item) => {
              const cfg = typeConfig[item.type]
              const Icon = cfg.icon
              return (
                <li key={item.id} className="flex items-start gap-3 px-6 py-3.5">
                  {/* Type icon */}
                  <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                    <Icon className={`size-3.5 ${cfg.color}`} />
                  </div>

                  {/* Message + actor */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {item.message}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <Avatar size="sm" className="size-4">
                        <AvatarFallback className={`text-[8px] font-bold ${cfg.avatarBg}`}>
                          {item.initials}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-muted-foreground">{item.actor}</p>
                    </div>
                  </div>

                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </li>
              )
            })}
          </ul>

          {/* Footer CTA */}
          <div className="border-t border-border px-6 py-3">
            <Button variant="link" size="sm" className="h-auto p-0 text-primary">
              View all activity →
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
