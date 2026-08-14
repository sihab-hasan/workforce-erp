import {
  UserPlus,
  CalendarCheck,
  FileText,
  AlertCircle,
  type LucideIcon,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card"
import { Avatar, AvatarFallback } from "@workforce-erp/ui/components/avatar"
import { Badge } from "@workforce-erp/ui/components/badge"
import { Button } from "@workforce-erp/ui/components/button"
import { Separator } from "@workforce-erp/ui/components/separator"

type ActivityKind = "hire" | "leave" | "document" | "alert"

interface ActivityItem {
  id: string
  kind: ActivityKind
  message: string
  actor: string
  initials: string
  timestamp: string
}

const activities: ActivityItem[] = [
  {
    id: "1",
    kind: "hire",
    message: "New employee onboarded",
    actor: "Sarah Mitchell",
    initials: "SM",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    kind: "leave",
    message: "Leave request approved",
    actor: "James Okonkwo",
    initials: "JO",
    timestamp: "4 hours ago",
  },
  {
    id: "4",
    kind: "document",
    message: "Contract document uploaded",
    actor: "Carlos Mendez",
    initials: "CM",
    timestamp: "Yesterday",
  },
  {
    id: "5",
    kind: "alert",
    message: "Probation period ending soon",
    actor: "Lena Fischer",
    initials: "LF",
    timestamp: "Yesterday",
  },
  {
    id: "6",
    kind: "hire",
    message: "Offer letter sent",
    actor: "Kwame Asante",
    initials: "KA",
    timestamp: "2 days ago",
  },
]

const kindIconMap: Record<ActivityKind, LucideIcon> = {
  hire: UserPlus,
  leave: CalendarCheck,
  document: FileText,
  alert: AlertCircle,
}

export interface ActivityFeedProps {
  className?: string
}

export function ActivityFeed({ className }: ActivityFeedProps) {
  return (
    <section aria-label="Recent activity" className={className}>
      <Card className="h-full rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest events across the platform</CardDescription>
        </CardHeader>

        <CardContent className="px-0">
          <ul role="list">
            {activities.map((item, idx) => {
              const Icon = kindIconMap[item.kind]
              return (
                <li key={item.id}>
                  {idx > 0 && <Separator />}
                  <div className="flex items-start gap-3 px-6 py-3.5">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon aria-hidden />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">{item.message}</p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <Avatar size="sm" className="size-4">
                          <AvatarFallback className="text-[8px]">
                            {item.initials}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-muted-foreground">
                          {item.actor}
                        </p>
                      </div>
                    </div>

                    <time className="shrink-0">
                      <Badge variant="outline">{item.timestamp}</Badge>
                    </time>
                  </div>
                </li>
              )
            })}
          </ul>
        </CardContent>

        <CardFooter className="border-t border-border">
          <Button variant="link" size="sm" className="h-auto p-0">
            View all activity
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}
