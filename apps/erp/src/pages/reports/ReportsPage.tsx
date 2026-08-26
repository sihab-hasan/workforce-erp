import { useQuery } from "@tanstack/react-query";
import { BarChart3, Building2, CalendarDays, Clock3, UsersRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { ErpPage, ErrorState, LoadingState, StatCard } from "#components/erp/ErpPage";
import { apiGet, errorMessage } from "#features/erp-core/api";
import { companyRoutes } from "#routes/paths";

type Overview = {
  employees: { total: number; active: number };
  departments: { total: number; active: number };
  leave: { pending: number; approved_this_month: number };
  timesheets: { this_month_hours: number; pending: number };
};

export default function ReportCenterPage() {
  const { tenantKey = "", companyKey = "" } = useParams();
  const query = useQuery({
    queryKey: ["reports", "overview", tenantKey, companyKey],
    queryFn: () => apiGet<Overview>("/api/v1/reports/overview"),
  });
  const base = companyRoutes.reports(tenantKey, companyKey);
  const cards = [
    {
      to: `${base}/employees`,
      title: "Employee report",
      description: "Headcount by status, employment type and department.",
      icon: UsersRound,
    },
    {
      to: `${base}/departments`,
      title: "Department report",
      description: "Department staffing, manager and company breakdown.",
      icon: Building2,
    },
    {
      to: `${base}/leave`,
      title: "Leave report",
      description: "Leave requests, approved days, status and leave-type analysis.",
      icon: CalendarDays,
    },
    {
      to: `${base}/timesheets`,
      title: "Timesheet report",
      description: "Recorded hours, workflow status and daily activity.",
      icon: Clock3,
    },
  ];

  return (
    <ErpPage
      title="Report center"
      description="Operational workforce reporting for the active company scope."
    >
      {query.isLoading ? (
        <LoadingState label="Loading report overview…" />
      ) : query.isError ? (
        <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />
      ) : query.data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Employees"
              value={query.data.employees.total}
              hint={`${query.data.employees.active} active`}
            />
            <StatCard
              label="Departments"
              value={query.data.departments.total}
              hint={`${query.data.departments.active} active`}
            />
            <StatCard
              label="Pending leave"
              value={query.data.leave.pending}
              hint={`${query.data.leave.approved_this_month} approved this month`}
            />
            <StatCard
              label="Hours this month"
              value={query.data.timesheets.this_month_hours.toFixed(1)}
              hint={`${query.data.timesheets.pending} timesheets pending`}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {cards.map(({ to, title, description, icon: Icon }) => (
              <Link key={to} to={to} className="group block">
                <Card className="h-full transition hover:border-primary/40 hover:shadow-sm">
                  <CardHeader className="flex-row items-start gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <CardTitle className="group-hover:text-primary">{title}</CardTitle>
                      <CardDescription className="mt-1">{description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center gap-2 text-sm font-medium text-primary">
                    <BarChart3 className="size-4" />
                    Open report
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </ErpPage>
  );
}
