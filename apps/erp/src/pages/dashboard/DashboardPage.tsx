import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bell, CalendarDays, Clock3, FileText, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { apiGet, errorMessage, formatDate } from "#features/erp-core/api";
import {
  ErpPage,
  ErrorState,
  LoadingState,
  SectionCard,
  StatCard,
  StatusPill,
} from "#components/erp/ErpPage";
import { companyRoutes } from "#routes/paths";
type Dashboard = {
  kpis: {
    employees: number;
    active_employees: number;
    departments: number;
    pending_leave: number;
    today_present: number;
    documents: number;
  };
  attendance: { present: number; completed: number; hours: number };
  recent_leave: {
    id: string;
    employee: string;
    type: string;
    status: string;
    start_date: string;
    end_date: string;
  }[];
  unread_notifications: number;
  role: string;
};
export default function DashboardPage() {
  const { tenantKey = "", companyKey = "" } = useParams();
  const q = useQuery({
    queryKey: ["dashboard", tenantKey, companyKey],
    queryFn: () => apiGet<Dashboard>("/api/v1/dashboard"),
    refetchInterval: 60000,
  });
  if (q.isLoading) return <LoadingState label="Loading workspace dashboard…" />;
  if (q.isError || !q.data)
    return <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />;
  const d = q.data;
  return (
    <ErpPage title="Dashboard" description={`Company workforce overview · ${d.role}`}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Employees" value={d.kpis.employees} />
        <StatCard label="Active" value={d.kpis.active_employees} />
        <StatCard label="Departments" value={d.kpis.departments} />
        <StatCard label="Pending leave" value={d.kpis.pending_leave} />
        <StatCard label="Present today" value={d.kpis.today_present} />
        <StatCard label="Documents" value={d.kpis.documents} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <SectionCard
          title="Today's attendance"
          description="Live timesheet state for the selected company."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric icon={<Users />} label="Clocked in" value={d.attendance.present} />
            <Metric icon={<Clock3 />} label="Completed" value={d.attendance.completed} />
            <Metric
              icon={<CalendarDays />}
              label="Recorded hours"
              value={d.attendance.hours.toFixed(2)}
            />
          </div>
          <div className="mt-5">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to={companyRoutes.timesheets(tenantKey, companyKey)} />}
            >
              Open timesheets
              <ArrowRight />
            </Button>
          </div>
        </SectionCard>
        <SectionCard title="Notifications" description="Unread workflow updates.">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-3xl bg-primary/10 text-primary">
              <Bell />
            </div>
            <div>
              <p className="text-3xl font-semibold">{d.unread_notifications}</p>
              <p className="text-sm text-muted-foreground">Unread notifications</p>
            </div>
          </div>
          <Button
            className="mt-5"
            variant="outline"
            nativeButton={false}
            render={<Link to={companyRoutes.notifications(tenantKey, companyKey)} />}
          >
            View notifications
          </Button>
        </SectionCard>
      </div>
      <SectionCard
        title="Recent leave requests"
        description="Latest leave workflow activity in this company."
      >
        {!d.recent_leave.length ? (
          <p className="text-sm text-muted-foreground">No leave requests yet.</p>
        ) : (
          <div className="divide-y divide-border/70">
            {d.recent_leave.map((l) => (
              <Link
                key={l.id}
                to={companyRoutes.leaveDetails(tenantKey, companyKey, l.id)}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-medium">
                    {l.employee} · {l.type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(l.start_date)} → {formatDate(l.end_date)}
                  </p>
                </div>
                <StatusPill value={l.status} />
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Quick
          href={companyRoutes.employees(tenantKey, companyKey)}
          icon={<Users />}
          title="Employees"
        />
        <Quick
          href={companyRoutes.leave(tenantKey, companyKey)}
          icon={<CalendarDays />}
          title="Leave"
        />
        <Quick
          href={companyRoutes.documents(tenantKey, companyKey)}
          icon={<FileText />}
          title="Documents"
        />
        <Quick
          href={companyRoutes.reports(tenantKey, companyKey)}
          icon={<ArrowRight />}
          title="Reports"
        />
      </div>
    </ErpPage>
  );
}
function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-3xl bg-muted/40 p-4">
      <div className="mb-3 text-muted-foreground">{icon}</div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
function Quick({ href, icon, title }: { href: string; icon: React.ReactNode; title: string }) {
  return (
    <Link
      to={href}
      className="flex items-center gap-3 rounded-4xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:ring-1 hover:ring-primary/30"
    >
      <span className="text-primary">{icon}</span>
      <span className="font-medium">{title}</span>
      <ArrowRight className="ml-auto size-4 text-muted-foreground" />
    </Link>
  );
}
