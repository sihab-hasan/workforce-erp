import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workforce-erp/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import { employeesListQueryOptions } from "#features/employees/api/employees.queries";
import type { Timesheet, TimesheetStatus } from "../types/timesheets.types";

export interface TimesheetFormValues {
  employee_id: string;
  date: string;
  clock_in: string;
  clock_out: string;
  status: TimesheetStatus;
}

export interface TimesheetFormProps {
  initialValue?: Timesheet | null;
  submitLabel?: string;
  pending?: boolean;
  disabled?: boolean;
  onSubmit: (values: TimesheetFormValues) => void | Promise<void>;
  onCancel?: () => void;
  className?: string;
}

const STATUSES: Array<{ value: TimesheetStatus; label: string }> = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "on-leave", label: "On leave" },
  { value: "half-day", label: "Half day" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function toDateInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function todayInput() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export function TimesheetForm({
  initialValue,
  submitLabel = "Save timesheet",
  pending = false,
  disabled = false,
  onSubmit,
  onCancel,
  className,
}: TimesheetFormProps) {
  const employeesQuery = useQuery(
    employeesListQueryOptions({ page: 1, per_page: 100, status: "active" }),
  );
  const employees = employeesQuery.data?.data ?? [];

  const defaults = useMemo<TimesheetFormValues>(
    () => ({
      employee_id: initialValue?.employee_id ?? "",
      date: toDateInput(initialValue?.date) || todayInput(),
      clock_in: toDateTimeLocal(initialValue?.clock_in),
      clock_out: toDateTimeLocal(initialValue?.clock_out),
      status: initialValue?.status ?? "present",
    }),
    [initialValue],
  );

  const [values, setValues] = useState(defaults);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => setValues(defaults), [defaults]);

  function update<K extends keyof TimesheetFormValues>(key: K, value: TimesheetFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setValidationError(null);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.employee_id) {
      setValidationError("Select an employee.");
      return;
    }
    if (!values.date) {
      setValidationError("Select a work date.");
      return;
    }
    if (values.clock_in && values.clock_out) {
      const start = new Date(values.clock_in).getTime();
      const end = new Date(values.clock_out).getTime();
      if (Number.isFinite(start) && Number.isFinite(end) && end < start) {
        setValidationError("Clock out cannot be earlier than clock in.");
        return;
      }
    }
    await onSubmit(values);
  }

  const isDisabled = disabled || pending;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Timesheet information</CardTitle>
        <CardDescription>
          Record the employee, work date, timestamps, and attendance status. Total hours are
          calculated by the server when both timestamps are provided.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={(event) => void submit(event)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="timesheet-employee">Employee</Label>
              {employeesQuery.isPending ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <select
                  id="timesheet-employee"
                  value={values.employee_id}
                  disabled={isDisabled || employeesQuery.isError}
                  onChange={(event) => update("employee_id", event.target.value)}
                  className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                      {employee.department ? ` · ${employee.department}` : ""}
                    </option>
                  ))}
                </select>
              )}
              {employeesQuery.isError && (
                <p className="text-xs text-destructive">
                  Unable to load employees. Refresh the page and try again.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timesheet-date">Work date</Label>
              <Input
                id="timesheet-date"
                type="date"
                value={values.date}
                disabled={isDisabled}
                onChange={(event) => update("date", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timesheet-status">Status</Label>
              <select
                id="timesheet-status"
                value={values.status}
                disabled={isDisabled}
                onChange={(event) => update("status", event.target.value as TimesheetStatus)}
                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timesheet-clock-in">Clock in</Label>
              <Input
                id="timesheet-clock-in"
                type="datetime-local"
                value={values.clock_in}
                disabled={isDisabled}
                onChange={(event) => update("clock_in", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timesheet-clock-out">Clock out</Label>
              <Input
                id="timesheet-clock-out"
                type="datetime-local"
                value={values.clock_out}
                disabled={isDisabled}
                onChange={(event) => update("clock_out", event.target.value)}
              />
            </div>
          </div>

          {validationError && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {validationError}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2 border-t pt-5">
            {onCancel && (
              <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isDisabled || employeesQuery.isPending || employeesQuery.isError}
            >
              {pending ? "Saving…" : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
