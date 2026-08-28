import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { Checkbox } from "@workforce-erp/ui/components/checkbox";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { Textarea } from "@workforce-erp/ui/components/textarea";
import { authenticationApi } from "#features/authentication/api/authentication.api";
import { ERP_PATHS, tenantRoutes } from "#routes/paths";

const steps = [
  "organization",
  "company",
  "locations",
  "departments",
  "settings",
  "modules",
  "team",
  "security",
  "complete",
] as const;
type Step = (typeof steps)[number];
type FormState = Record<string, unknown>;
const pathFor: Record<Step, string> = {
  organization: ERP_PATHS.onboardingOrganization,
  company: ERP_PATHS.onboardingCompany,
  locations: ERP_PATHS.onboardingLocations,
  departments: ERP_PATHS.onboardingDepartments,
  settings: ERP_PATHS.onboardingSettings,
  modules: ERP_PATHS.onboardingModules,
  team: ERP_PATHS.onboardingTeam,
  security: ERP_PATHS.onboardingSecurity,
  complete: ERP_PATHS.onboardingComplete,
};
const labels: Record<Step, string> = {
  organization: "Organization profile",
  company: "Company / legal entity",
  locations: "Branches / locations",
  departments: "Departments",
  settings: "Fiscal, timezone & HR settings",
  modules: "Module selection",
  team: "Invite team",
  security: "Sign-in & verification",
  complete: "Review & finish",
};
const optional = new Set<Step>(["locations", "departments", "team"]);
const fieldClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const DEFAULTS: Record<Step, FormState> = {
  organization: {
    name: "",
    legal_name: "",
    country: "BD",
    email: "",
    phone: "",
    address: "",
    timezone: "Asia/Dhaka",
    locale: "en",
  },
  company: { name: "", code: "HQ", address: "", email: "", phone: "", timezone: "Asia/Dhaka" },
  locations: { locations: [{ name: "", code: "", address: "", timezone: "Asia/Dhaka" }] },
  departments: { departments: [{ name: "", code: "", branch_id: "" }] },
  settings: {
    timezone: "Asia/Dhaka",
    currency: "BDT",
    fiscal_year_start_month: 1,
    locale: "en",
    work_week_days: [1, 2, 3, 4, 5],
    default_workday_hours: 8,
    leave_year_start_month: 1,
  },
  modules: { modules: ["hr", "attendance", "leave", "documents", "reports", "users", "security"] },
  team: { invitations: [{ name: "", email: "", roles: ["employee"], data_scope: "OWN" }] },
  security: {
    require_mfa_for_privileged: true,
    allow_email_code: true,
    allow_sms_code: true,
    allow_authenticator: true,
  },
  complete: {},
};

export default function OnboardingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requested = location.pathname.split("/").filter(Boolean).at(-1);
  const routeStep = steps.includes(requested as Step) ? (requested as Step) : null;
  const tenant =
    params.get("tenant") || sessionStorage.getItem("workforce-erp.onboarding.tenant") || "";
  const [current, setCurrent] = useState<Step>(routeStep || "organization");
  const [saved, setSaved] = useState<Record<string, FormState>>({});
  const [form, setForm] = useState<FormState>({ ...DEFAULTS.organization });
  const [modules, setModules] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<Array<{ name: string; description?: string | null }>>([]);
  const [stepStatus, setStepStatus] = useState<Record<string, { status: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!tenant) {
      setError("Organization context is required.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    void authenticationApi
      .onboarding(tenant)
      .then((r) => {
        if (cancelled) return;
        const payload = r.data;
        setSaved((payload.data || {}) as Record<string, FormState>);
        setModules(payload.modules || {});
        setRoles(payload.roles || []);
        setStepStatus(payload.step_status || {});
        const target = routeStep || (payload.step as Step) || "organization";
        setCurrent(target);
        if (!routeStep)
          navigate(`${pathFor[target]}?tenant=${encodeURIComponent(tenant)}`, { replace: true });
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Onboarding could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tenant, routeStep, navigate]);
  useEffect(() => {
    const base = structuredClone(DEFAULTS[current]);
    const existing = saved[current];
    setForm(existing && Object.keys(existing).length ? { ...base, ...existing } : base);
  }, [current, saved]);
  const index = useMemo(() => Math.max(0, steps.indexOf(current)), [current]);
  const branchOptions = useMemo(() => {
    const all: Array<{ id: string; name: string }> = [];
    const c = saved.company as Record<string, unknown> | undefined;
    if (c?.id) all.push({ id: String(c.id), name: String(c.name || "Primary company") });
    const loc = (saved.locations?.locations as Array<Record<string, unknown>> | undefined) || [];
    for (const b of loc)
      if (b.id && !all.some((x) => x.id === String(b.id)))
        all.push({ id: String(b.id), name: String(b.name || b.code || b.id) });
    return all;
  }, [saved]);
  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));
  const rows = (key: string) =>
    Array.isArray(form[key]) ? (form[key] as Array<Record<string, unknown>>) : [];
  const setRow = (key: string, i: number, field: string, value: unknown) =>
    set(
      key,
      rows(key).map((r, n) => (n === i ? { ...r, [field]: value } : r)),
    );
  const addRow = (key: string, template: Record<string, unknown>) =>
    set(key, [...rows(key), template]);
  const removeRow = (key: string, i: number) =>
    set(
      key,
      rows(key).filter((_, n) => n !== i),
    );
  async function save(skip = false) {
    if (!tenant) return;
    setLoading(true);
    setError(null);
    try {
      const r = await authenticationApi.saveOnboarding(tenant, current, form, true, skip);
      const payload = r.data;
      setSaved((payload.data || {}) as Record<string, FormState>);
      if (current === "complete" || payload.status === "completed") {
        sessionStorage.removeItem("workforce-erp.onboarding.tenant");
        navigate(tenantRoutes.selectCompany(tenant), { replace: true });
        return;
      }
      const next = (payload.step as Step) || "complete";
      setStepStatus((prev) => ({ ...prev, [current]: { status: skip ? "skipped" : "completed" } }));
      setCurrent(next);
      navigate(
        `${pathFor[next] ?? ERP_PATHS.onboardingComplete}?tenant=${encodeURIComponent(tenant)}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Onboarding step could not be saved.");
    } finally {
      setLoading(false);
    }
  }
  if (loading && !Object.keys(saved).length)
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </main>
    );
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <header className="mb-8">
        <p className="text-sm font-medium text-primary">Organization onboarding</p>
        <h1 className="mt-1 text-3xl font-semibold">{labels[current]}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Step {index + 1} of {steps.length}. Every completed step is validated and stored for this
          tenant.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <nav aria-label="Onboarding steps" className="space-y-1">
          {steps.map((s, i) => (
            <Link
              key={s}
              to={`${pathFor[s]}?tenant=${encodeURIComponent(tenant)}`}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${s === current ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <span>
                {i + 1}. {labels[s]}
              </span>
              {stepStatus[s]?.status &&
              ["completed", "skipped"].includes(stepStatus[s]?.status ?? "") ? (
                <CheckCircle2 className="size-4" />
              ) : null}
            </Link>
          ))}
        </nav>
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <StepFields
            step={current}
            form={form}
            set={set}
            rows={rows}
            setRow={setRow}
            addRow={addRow}
            removeRow={removeRow}
            modules={modules}
            roles={roles}
            branchOptions={branchOptions}
          />
          {current === "security" ? (
            <p className="mt-4 text-sm">
              <Link className="text-primary hover:underline" to={ERP_PATHS.verifyPhone}>
                Verify a phone number
              </Link>{" "}
              ·{" "}
              <Link
                className="text-primary hover:underline"
                to={tenant ? tenantRoutes.securitySettings(tenant) : ERP_PATHS.onboardingSecurity}
              >
                Manage authenticator app
              </Link>
            </p>
          ) : null}
          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
          <footer className="mt-6 flex flex-wrap justify-end gap-2">
            {optional.has(current) ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void save(true)}
                disabled={loading}
              >
                Skip optional step
              </Button>
            ) : null}
            <Button type="button" onClick={() => void save(false)} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving…
                </>
              ) : current === "complete" ? (
                "Finish onboarding"
              ) : (
                "Save & continue"
              )}
            </Button>
          </footer>
        </section>
      </div>
    </main>
  );
}

function StepFields({
  step,
  form,
  set,
  rows,
  setRow,
  addRow,
  removeRow,
  modules,
  roles,
  branchOptions,
}: {
  step: Step;
  form: FormState;
  set: (k: string, v: unknown) => void;
  rows: (k: string) => Array<Record<string, unknown>>;
  setRow: (k: string, i: number, f: string, v: unknown) => void;
  addRow: (k: string, t: Record<string, unknown>) => void;
  removeRow: (k: string, i: number) => void;
  modules: Record<string, string>;
  roles: Array<{ name: string; description?: string | null }>;
  branchOptions: Array<{ id: string; name: string }>;
}) {
  const input = (key: string, label: string, type = "text", placeholder = "") => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        type={type}
        value={String(form[key] ?? "")}
        placeholder={placeholder}
        onChange={(e) => set(key, type === "number" ? Number(e.target.value) : e.target.value)}
      />
    </div>
  );
  if (step === "organization")
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {input("name", "Organization name")}
        {input("legal_name", "Legal name")}
        {input("country", "Country code", "text", "BD")}
        {input("email", "Work email", "email")}
        {input("phone", "Phone", "tel", "+8801…")}
        {input("timezone", "Timezone", "text", "Asia/Dhaka")}
        {input("locale", "Locale", "text", "en")}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={String(form.address ?? "")}
            onChange={(e) => set("address", e.target.value)}
          />
        </div>
      </div>
    );
  if (step === "company")
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {input("name", "Company / legal entity name")}
        {input("code", "Company code")}
        {input("email", "Company email", "email")}
        {input("phone", "Company phone", "tel")}
        {input("timezone", "Timezone")}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="company-address">Address</Label>
          <Textarea
            id="company-address"
            value={String(form.address ?? "")}
            onChange={(e) => set("address", e.target.value)}
          />
        </div>
      </div>
    );
  if (step === "locations")
    return (
      <RowsEditor
        title="Branches / locations"
        rows={rows("locations")}
        add={() => addRow("locations", { name: "", code: "", address: "", timezone: "Asia/Dhaka" })}
        remove={(i) => removeRow("locations", i)}
      >
        {(r, i) => (
          <div className="grid gap-3 md:grid-cols-4">
            <Input
              aria-label="Location name"
              placeholder="Location name"
              value={String(r.name ?? "")}
              onChange={(e) => setRow("locations", i, "name", e.target.value)}
            />
            <Input
              aria-label="Location code"
              placeholder="Code"
              value={String(r.code ?? "")}
              onChange={(e) => setRow("locations", i, "code", e.target.value)}
            />
            <Input
              aria-label="Location address"
              placeholder="Address"
              value={String(r.address ?? "")}
              onChange={(e) => setRow("locations", i, "address", e.target.value)}
            />
            <Input
              aria-label="Location timezone"
              placeholder="Timezone"
              value={String(r.timezone ?? "")}
              onChange={(e) => setRow("locations", i, "timezone", e.target.value)}
            />
          </div>
        )}
      </RowsEditor>
    );
  if (step === "departments")
    return (
      <RowsEditor
        title="Departments"
        rows={rows("departments")}
        add={() =>
          addRow("departments", { name: "", code: "", branch_id: branchOptions[0]?.id || "" })
        }
        remove={(i) => removeRow("departments", i)}
      >
        {(r, i) => (
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              aria-label="Department name"
              placeholder="Department name"
              value={String(r.name ?? "")}
              onChange={(e) => setRow("departments", i, "name", e.target.value)}
            />
            <Input
              aria-label="Department code"
              placeholder="Code"
              value={String(r.code ?? "")}
              onChange={(e) => setRow("departments", i, "code", e.target.value)}
            />
            <select
              aria-label="Department branch"
              className={fieldClass}
              value={String(r.branch_id ?? "")}
              onChange={(e) => setRow("departments", i, "branch_id", Number(e.target.value))}
            >
              <option value="">Select branch</option>
              {branchOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </RowsEditor>
    );
  if (step === "settings")
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {input("timezone", "Timezone")}
        {input("currency", "Currency", "text", "BDT")}
        {input("fiscal_year_start_month", "Fiscal year start month", "number")}
        {input("locale", "Locale")}
        {input("default_workday_hours", "Default workday hours", "number")}
        {input("leave_year_start_month", "Leave year start month", "number")}
        <div className="space-y-2 md:col-span-2">
          <Label>Work week days</Label>
          <div className="flex flex-wrap gap-3">
            {[
              [1, "Mon"],
              [2, "Tue"],
              [3, "Wed"],
              [4, "Thu"],
              [5, "Fri"],
              [6, "Sat"],
              [7, "Sun"],
            ].map(([n, l]) => {
              const selected = (form.work_week_days as number[] | undefined) || [];
              return (
                <label key={n} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selected.includes(Number(n))}
                    onCheckedChange={(v) =>
                      set(
                        "work_week_days",
                        v
                          ? [...selected, Number(n)].sort()
                          : selected.filter((x) => x !== Number(n)),
                      )
                    }
                  />
                  {l}
                </label>
              );
            })}
          </div>
        </div>
      </div>
    );
  if (step === "modules") {
    const selected = (form.modules as string[] | undefined) || [];
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Choose the modules enabled for this tenant subscription.
        </p>
        {Object.entries(modules).map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 rounded-md border p-3">
            <Checkbox
              checked={selected.includes(key)}
              onCheckedChange={(v) =>
                set("modules", v ? [...selected, key] : selected.filter((x) => x !== key))
              }
            />
            <span>
              <span className="font-medium">{label}</span>
              <span className="ml-2 text-xs text-muted-foreground">{key}</span>
            </span>
          </label>
        ))}
      </div>
    );
  }
  if (step === "team")
    return (
      <RowsEditor
        title="Team invitations"
        rows={rows("invitations")}
        add={() =>
          addRow("invitations", { name: "", email: "", roles: ["employee"], data_scope: "OWN" })
        }
        remove={(i) => removeRow("invitations", i)}
      >
        {(r, i) => (
          <div className="grid gap-3 md:grid-cols-4">
            <Input
              aria-label="Invitee name"
              placeholder="Full name"
              value={String(r.name ?? "")}
              onChange={(e) => setRow("invitations", i, "name", e.target.value)}
            />
            <Input
              aria-label="Invitee email"
              type="email"
              placeholder="Work email"
              value={String(r.email ?? "")}
              onChange={(e) => setRow("invitations", i, "email", e.target.value)}
            />
            <select
              aria-label="Invitee role"
              className={fieldClass}
              value={String((r.roles as string[] | undefined)?.[0] || "employee")}
              onChange={(e) => setRow("invitations", i, "roles", [e.target.value])}
            >
              {roles.map((role) => (
                <option key={role.name} value={role.name}>
                  {role.name.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <select
              aria-label="Invitee data scope"
              className={fieldClass}
              value={String(r.data_scope ?? "OWN")}
              onChange={(e) => setRow("invitations", i, "data_scope", e.target.value)}
            >
              {[
                "OWN",
                "DIRECT_REPORTS",
                "TEAM",
                "DEPARTMENT",
                "BRANCH",
                "COMPANY",
                "BUSINESS_UNIT",
                "ORGANIZATION",
              ].map((x) => (
                <option key={x} value={x}>
                  {x.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
        )}
      </RowsEditor>
    );
  if (step === "security")
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Only Authenticator App, Email Code and SMS Code are supported. Privileged users should
          require MFA.
        </p>
        {(
          [
            ["require_mfa_for_privileged", "Require MFA for privileged users"],
            ["allow_authenticator", "Allow Authenticator App"],
            ["allow_email_code", "Allow Email Code"],
            ["allow_sms_code", "Allow SMS Code"],
          ] as const
        ).map(([k, l]) => (
          <label key={k} className="flex items-center gap-3 rounded-md border p-3">
            <Checkbox checked={Boolean(form[k])} onCheckedChange={(v) => set(k, Boolean(v))} />
            <span>{l}</span>
          </label>
        ))}
      </div>
    );
  return (
    <div className="space-y-4">
      <CheckCircle2 className="size-10 text-primary" />
      <h2 className="text-xl font-semibold">Ready to finish</h2>
      <p className="text-sm text-muted-foreground">
        Required steps are revalidated on the server before onboarding is marked complete. You can
        return to any step above to review saved settings.
      </p>
    </div>
  );
}

function RowsEditor({
  title,
  rows,
  add,
  remove,
  children,
}: {
  title: string;
  rows: Array<Record<string, unknown>>;
  add: () => void;
  remove: (i: number) => void;
  children: (row: Record<string, unknown>, i: number) => React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">
            Add one or more entries, or skip this optional step.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="mr-2 size-4" />
          Add
        </Button>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="mb-3 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(i)}
              disabled={rows.length <= 1}
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Remove row</span>
            </Button>
          </div>
          {children(r, i)}
        </div>
      ))}
    </div>
  );
}
