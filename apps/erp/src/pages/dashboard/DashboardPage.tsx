import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  UserPlus,
  Users,
  Workflow,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { apiGet, errorMessage, formatDate } from "#features/erp-core/api";
import {
  ErpPage,
  ErrorState,
  LoadingState,
  SectionCard,
  StatCard,
  StatusPill,
} from "#components/erp/ErpPage";
import { companyRoutes, tenantRoutes } from "#routes/paths";

type LeaveRow = {
  id: string;
  employee: string | null;
  type: string | null;
  status: string;
  start_date: string;
  end_date: string;
};

type OwnerDashboardData = {
  view: "owner";
  kpis: {
    employees: number;
    active_employees: number;
    departments: number;
    pending_leave: number;
    today_present: number;
    on_leave_today: number;
    documents: number;
  };
  attendance: { present: number; completed: number; hours: number };
  today_attendance: {
    id: string;
    employee: string | null;
    clock_in: string | null;
    clock_out: string | null;
  }[];
  recent_leave: LeaveRow[];
  unread_notifications: number;
  role: string;
};

type EmployeeDashboardData = {
  view: "employee";
  me: { employee_id: string | null; name: string };
  today: { clock_in: string | null; clock_out: string | null; hours: number };
  my_leave: { pending: number; approved: number; recent: LeaveRow[] };
  attendance_month: {
    month: string;
    working_days: number;
    present: number;
    absent: number;
    leave: number;
  };
  my_documents: number;
  unread_notifications: number;
  role: string;
};

type Dashboard = OwnerDashboardData | EmployeeDashboardData;

function formatTime(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

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

  return q.data.view === "owner" ? (
    <OwnerDashboard d={q.data} tenantKey={tenantKey} companyKey={companyKey} />
  ) : (
    <EmployeeDashboard d={q.data} tenantKey={tenantKey} companyKey={companyKey} />
  );
}

function OwnerDashboard({
  d,
  tenantKey,
  companyKey,
}: {
  d: OwnerDashboardData;
  tenantKey: string;
  companyKey: string;
}) {
  return (
    <ErpPage title="Dashboard" description={`Company workforce overview · ${d.role}`}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Employees" value={d.kpis.employees} />
        <StatCard label="Present today" value={d.kpis.today_present} />
        <StatCard label="On leave today" value={d.kpis.on_leave_today} />
        <StatCard label="Pending leave" value={d.kpis.pending_leave} />
        <StatCard label="Departments" value={d.kpis.departments} />
        <StatCard label="Documents" value={d.kpis.documents} />
      </div>

      <SectionCard title="Today's attendance" description="Who clocked in and when.">
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <Metric icon={<Users />} label="Clocked in" value={d.attendance.present} />
          <Metric icon={<Clock3 />} label="Clocked out" value={d.attendance.completed} />
          <Metric icon={<CalendarDays />} label="Recorded hours" value={d.attendance.hours.toFixed(2)} />
        </div>
        {!d.today_attendance.length ? (
          <p className="text-sm text-muted-foreground">No one has clocked in yet.</p>
        ) : (
          <div className="divide-y divide-border/70">
            {d.today_attendance.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <p className="font-medium">{a.employee ?? "Unknown"}</p>
                <p className="text-sm text-muted-foreground">
                  In {formatTime(a.clock_in)} · Out {formatTime(a.clock_out)}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Leave requests" description="Latest requests waiting for you.">
        <LeaveList rows={d.recent_leave} tenantKey={tenantKey} companyKey={companyKey} />
      </SectionCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Quick href={companyRoutes.employeeCreate(tenantKey, companyKey)} icon={<UserPlus />} title="Add employee" />
        <Quick href={tenantRoutes.companyCreate(tenantKey)} icon={<Building2 />} title="Add branch" />
        <Quick href={companyRoutes.approvals(tenantKey, companyKey)} icon={<CheckCircle2 />} title="Approvals" />
        <Quick href={companyRoutes.documents(tenantKey, companyKey)} icon={<FileText />} title="Documents" />
      </div>
    </ErpPage>
  );
}

function EmployeeDashboard({
  d,
  tenantKey,
  companyKey,
}: {
  d: EmployeeDashboardData;
  tenantKey: string;
  companyKey: string;
}) {
  return (
    <ErpPage title={`Hi, ${d.me.name}`} description="Your day at a glance">
      {!d.me.employee_id ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Your account is not linked to an employee record yet. Ask the owner to link it.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Clock in" value={formatTime(d.today.clock_in)} />
        <StatCard label="Clock out" value={formatTime(d.today.clock_out)} />
        <StatCard label="Pending leave" value={d.my_leave.pending} />
        <StatCard label="My documents" value={d.my_documents} />
      </div>

      <SectionCard
        title="My attendance"
        description={`${d.attendance_month.month} · ${d.attendance_month.working_days} working days so far`}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric icon={<Users />} label="Present" value={d.attendance_month.present} />
          <Metric icon={<Clock3 />} label="Absent" value={d.attendance_month.absent} />
          <Metric icon={<CalendarDays />} label="On leave" value={d.attendance_month.leave} />
        </div>
      </SectionCard>

      <SectionCard title="My leave requests" description="Status of your requests.">
        <LeaveList rows={d.my_leave.recent} tenantKey={tenantKey} companyKey={companyKey} />
      </SectionCard>

      <SectionCard title="Notifications" description="Unread updates.">
        <div className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-3xl bg-primary/10 text-primary">
            <Bell />
          </div>
          <p className="text-3xl font-semibold">{d.unread_notifications}</p>
        </div>
      </SectionCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Quick href={companyRoutes.leaveCreate(tenantKey, companyKey)} icon={<CalendarDays />} title="Request leave" />
        <Quick href={companyRoutes.timesheets(tenantKey, companyKey)} icon={<Clock3 />} title="My timesheet" />
        <Quick href={companyRoutes.documents(tenantKey, companyKey)} icon={<FileText />} title="Documents" />
        <Quick href={companyRoutes.reports(tenantKey, companyKey)} icon={<Workflow />} title="Reports" />
      </div>
    </ErpPage>
  );
}

function LeaveList({
  rows,
  tenantKey,
  companyKey,
}: {
  rows: LeaveRow[];
  tenantKey: string;
  companyKey: string;
}) {
  if (!rows.length) return <p className="text-sm text-muted-foreground">No leave requests yet.</p>;
  return (
    <div className="divide-y divide-border/70">
      {rows.map((l) => (
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
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
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
