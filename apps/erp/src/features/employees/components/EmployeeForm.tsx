import { useState, type FormEvent } from "react";
import {
  Building2,
  Calendar,
  Mail,
  MapPin,
  Phone,
  Shield,
  Briefcase,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workforce-erp/ui/components/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workforce-erp/ui/components/tabs";
import { Avatar, AvatarFallback } from "@workforce-erp/ui/components/avatar";
import type { EmploymentStatus, EmploymentType } from "../types/employees.types";

export interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  title: string;
  department_id?: string;
  department_name?: string;
  location_id?: string;
  location_name?: string;
  manager_id?: string;
  manager_name?: string;
  employment_type: EmploymentType;
  status: EmploymentStatus;
  hire_date: string;
  salary?: string;
}

export type OptionItem = string | { id: string; name: string };

export interface EmployeeFormProps {
  initialValues?: Partial<EmployeeFormData>;
  departments?: OptionItem[];
  locations?: OptionItem[];
  managers?: OptionItem[];
  isPending?: boolean;
  serverError?: string | null;
  onSubmit: (values: EmployeeFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
  className?: string;
}

function normalizeOptions(items: OptionItem[]): Array<{ id: string; name: string }> {
  return items.map((item) => (typeof item === "string" ? { id: item, name: item } : item));
}

export function EmployeeForm({
  initialValues,
  departments = [],
  locations = [],
  managers = [],
  isPending = false,
  serverError,
  onSubmit,
  onCancel,
  submitLabel = "Save Employee",
  className,
}: EmployeeFormProps) {
  const normDepartments = normalizeOptions(departments);
  const normLocations = normalizeOptions(locations);
  const normManagers = normalizeOptions(managers);

  const [formData, setFormData] = useState<EmployeeFormData>({
    first_name: initialValues?.first_name ?? "",
    last_name: initialValues?.last_name ?? "",
    email: initialValues?.email ?? "",
    phone: initialValues?.phone ?? "",
    title: initialValues?.title ?? "",
    department_id: initialValues?.department_id ?? "",
    department_name: initialValues?.department_name ?? "",
    location_id: initialValues?.location_id ?? "",
    location_name: initialValues?.location_name ?? "",
    manager_id: initialValues?.manager_id ?? "",
    manager_name: initialValues?.manager_name ?? "",
    employment_type: initialValues?.employment_type ?? "full-time",
    status: initialValues?.status ?? "active",
    hire_date: initialValues?.hire_date ?? new Date().toISOString().split("T")[0] ?? "",
    salary: initialValues?.salary ?? "",
  });

  const [activeTab, setActiveTab] = useState("general");
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof EmployeeFormData>(key: K, value: EmployeeFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (clientErrors[key]) {
      setClientErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.first_name.trim()) errs.first_name = "First name is required.";
    if (!formData.last_name.trim()) errs.last_name = "Last name is required.";
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errs.email = "Valid work email is required.";
    }
    if (!formData.title.trim()) errs.title = "Job title is required.";
    if (!formData.hire_date) errs.hire_date = "Hire date is required.";

    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || isPending) return;
    onSubmit(formData);
  };

  const initials =
    `${formData.first_name.charAt(0) || ""}${formData.last_name.charAt(0) || ""}`.toUpperCase() ||
    "EP";

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      <div className="space-y-6">
        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p className="font-medium">{serverError}</p>
          </div>
        )}

        {/* Header Preview Card */}
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 rounded-xl border-2 border-primary/20 text-lg">
              <AvatarFallback className="font-bold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {formData.first_name || formData.last_name
                  ? `${formData.first_name} ${formData.last_name}`
                  : "New Employee Record"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formData.title || "Specify title"} · {formData.email || "No email assigned"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary capitalize">
              <span className="size-1.5 rounded-full bg-primary" />
              {formData.employment_type.replace("-", " ")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground capitalize">
              {formData.status.replace("-", " ")}
            </span>
          </div>
        </div>

        {/* Tabs for Form Sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="general">Personal</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="organization">Workplace</TabsTrigger>
          </TabsList>

          {/* Tab 1: Personal Information */}
          <TabsContent value="general" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Primary identity and contact details for this worker
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emp-first-name">First Name *</Label>
                  <Input
                    id="emp-first-name"
                    placeholder="e.g. Jane"
                    value={formData.first_name}
                    onChange={(e) => update("first_name", e.target.value)}
                    disabled={isPending}
                    aria-invalid={Boolean(clientErrors.first_name)}
                  />
                  {clientErrors.first_name && (
                    <p className="text-xs text-destructive">{clientErrors.first_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emp-last-name">Last Name *</Label>
                  <Input
                    id="emp-last-name"
                    placeholder="e.g. Doe"
                    value={formData.last_name}
                    onChange={(e) => update("last_name", e.target.value)}
                    disabled={isPending}
                    aria-invalid={Boolean(clientErrors.last_name)}
                  />
                  {clientErrors.last_name && (
                    <p className="text-xs text-destructive">{clientErrors.last_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emp-email">Work Email *</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="emp-email"
                      type="email"
                      placeholder="jane.doe@organization.com"
                      value={formData.email}
                      onChange={(e) => update("email", e.target.value)}
                      className="pl-8"
                      disabled={isPending}
                      aria-invalid={Boolean(clientErrors.email)}
                    />
                  </div>
                  {clientErrors.email && (
                    <p className="text-xs text-destructive">{clientErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emp-phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="emp-phone"
                      type="tel"
                      placeholder="+880 1700 000000"
                      value={formData.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className="pl-8"
                      disabled={isPending}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Employment Details */}
          <TabsContent value="employment" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Role & Status</CardTitle>
                <CardDescription>
                  Job title, employment contract, and onboarding dates
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="emp-title">Job Title *</Label>
                  <div className="relative">
                    <Briefcase className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="emp-title"
                      placeholder="e.g. Senior Software Engineer"
                      value={formData.title}
                      onChange={(e) => update("title", e.target.value)}
                      className="pl-8"
                      disabled={isPending}
                      aria-invalid={Boolean(clientErrors.title)}
                    />
                  </div>
                  {clientErrors.title && (
                    <p className="text-xs text-destructive">{clientErrors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emp-type">Employment Type</Label>
                  <Select
                    value={formData.employment_type}
                    onValueChange={(val) => {
                      if (val) update("employment_type", val as EmploymentType);
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger id="emp-type">
                      <SelectValue placeholder="Select contract type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time Regular</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contractor">Contractor / Consultant</SelectItem>
                      <SelectItem value="intern">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emp-status">Employment Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => {
                      if (val) update("status", val as EmploymentStatus);
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger id="emp-status">
                      <SelectValue placeholder="Select current status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="probation">Probationary</SelectItem>
                      <SelectItem value="on-leave">On Leave</SelectItem>
                      <SelectItem value="inactive">Inactive / Resigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emp-hire-date">Hire Date *</Label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="emp-hire-date"
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => update("hire_date", e.target.value)}
                      className="pl-8"
                      disabled={isPending}
                      aria-invalid={Boolean(clientErrors.hire_date)}
                    />
                  </div>
                  {clientErrors.hire_date && (
                    <p className="text-xs text-destructive">{clientErrors.hire_date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emp-salary">Base Salary (Annual / Monthly)</Label>
                  <Input
                    id="emp-salary"
                    placeholder="e.g. 120,000 BDT"
                    value={formData.salary}
                    onChange={(e) => update("salary", e.target.value)}
                    disabled={isPending}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Organization & Hierarchy */}
          <TabsContent value="organization" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workplace & Hierarchy</CardTitle>
                <CardDescription>
                  Department, branch office, and reporting structure
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emp-dept">Department</Label>
                  {normDepartments.length > 0 ? (
                    <Select
                      value={formData.department_id || formData.department_name}
                      onValueChange={(val) => {
                        if (!val) return;
                        const dept = normDepartments.find((d) => d.id === val || d.name === val);
                        update("department_id", dept?.id ?? val);
                        update("department_name", dept?.name ?? val);
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger id="emp-dept">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {normDepartments.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="emp-dept"
                        placeholder="e.g. Engineering"
                        value={formData.department_name}
                        onChange={(e) => update("department_name", e.target.value)}
                        className="pl-8"
                        disabled={isPending}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emp-loc">Location / Office Branch</Label>
                  {normLocations.length > 0 ? (
                    <Select
                      value={formData.location_id || formData.location_name}
                      onValueChange={(val) => {
                        if (!val) return;
                        const loc = normLocations.find((l) => l.id === val || l.name === val);
                        update("location_id", loc?.id ?? val);
                        update("location_name", loc?.name ?? val);
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger id="emp-loc">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {normLocations.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="emp-loc"
                        placeholder="e.g. Dhaka HQ"
                        value={formData.location_name}
                        onChange={(e) => update("location_name", e.target.value)}
                        className="pl-8"
                        disabled={isPending}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="emp-manager">Direct Reporting Manager</Label>
                  {normManagers.length > 0 ? (
                    <Select
                      value={formData.manager_id || formData.manager_name}
                      onValueChange={(val) => {
                        if (!val) return;
                        const mgr = normManagers.find((m) => m.id === val || m.name === val);
                        update("manager_id", mgr?.id ?? val);
                        update("manager_name", mgr?.name ?? val);
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger id="emp-manager">
                        <SelectValue placeholder="Select supervisor" />
                      </SelectTrigger>
                      <SelectContent>
                        {normManagers.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="relative">
                      <Shield className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="emp-manager"
                        placeholder="e.g. Alex Johnson (Engineering Lead)"
                        value={formData.manager_name}
                        onChange={(e) => update("manager_name", e.target.value)}
                        className="pl-8"
                        disabled={isPending}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 border-t pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Saving…
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
