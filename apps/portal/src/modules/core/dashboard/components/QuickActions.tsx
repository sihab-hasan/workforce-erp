import { Link } from "react-router-dom"
import { UserPlus, CalendarPlus, ClipboardList, FileSearch, DollarSign, Users } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workforce-erp/ui/components/card"
import { Button } from "@workforce-erp/ui/components/button"

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
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
  },
  {
    label: "New Leave Request",
    description: "Submit or review time-off",
    to: "/people/leave",
    icon: CalendarPlus,
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
  },
  {
    label: "View Attendance",
    description: "Check today's presence log",
    to: "/people/attendance",
    icon: ClipboardList,
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
  },
  {
    label: "Review Documents",
    description: "Manage employee files",
    to: "/people/documents",
    icon: FileSearch,
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
  },
  {
    label: "Payroll Runs",
    description: "Process salary operations",
    to: "/people/payroll",
    icon: DollarSign,
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-400",
  },
  {
    label: "Departments",
    description: "Manage org structure",
    to: "/people/departments",
    icon: Users,
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-400",
  },
]

export interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className }: QuickActionsProps) {
  return (
    <section className={className}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks at a glance</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="grid grid-cols-2 gap-px bg-border">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.label}
                  variant="ghost"
                  className="h-auto flex-col items-start gap-2 rounded-none bg-card p-4 text-left hover:bg-accent"
                  render={<Link to={action.to} />}
                >
                  <div className={`flex size-9 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${action.iconBg}`}>
                    <Icon className={`size-4 ${action.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {action.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
