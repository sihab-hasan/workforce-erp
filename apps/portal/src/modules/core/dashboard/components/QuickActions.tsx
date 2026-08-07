import { Link } from "react-router-dom"
import {
  UserPlus,
  CalendarPlus,
  FileSearch,
  Receipt,
  Building2,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card"
import { Button } from "@workforce-erp/ui/components/button"

interface QuickAction {
  label: string
  description: string
  to: string
  icon: React.ElementType
}

const actions: QuickAction[] = [
  {
    label: "Add Employee",
    description: "Onboard a new team member",
    to: "/people/employees",
    icon: UserPlus,
  },
  {
    label: "Request Leave",
    description: "Submit or review time-off",
    to: "/people/leave",
    icon: CalendarPlus,
  },
  {
    label: "Documents",
    description: "Manage employee files",
    to: "/people/documents",
    icon: FileSearch,
  },
  {
    label: "Payroll",
    description: "Process salary operations",
    to: "/people/payroll",
    icon: Receipt,
  },
  {
    label: "Departments",
    description: "Manage org structure",
    to: "/people/departments",
    icon: Building2,
  },
]

export interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className }: QuickActionsProps) {
  return (
    <section aria-label="Quick actions" className={className}>
      <Card className="h-full rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Shortcuts to common tasks</CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto min-h-24 flex-col items-start justify-start gap-2 rounded-lg py-4 text-left"
                render={<Link to={action.to} />}
              >
                <Icon data-icon="inline-start" aria-hidden />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {action.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </Button>
            )
          })}
        </CardContent>
      </Card>
    </section>
  )
}
