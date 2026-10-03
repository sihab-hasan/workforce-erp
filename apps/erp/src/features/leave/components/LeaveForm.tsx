import { useMemo, useState, type FormEvent } from "react";
import { AlertCircle, Calendar, Clock, Info, Loader2, Send } from "lucide-react";
import { Badge } from "@workforce-erp/ui/components/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workforce-erp/ui/components/select";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import { Textarea } from "@workforce-erp/ui/components/textarea";
import { useLeaveOptionsQuery } from "../api/leave.queries";
import {
  countWorkingDays,
  createLeaveFormSchema,
  LEAVE_REASON_MAX_LENGTH,
  type LeaveFormValues,
} from "../schemas/leave.schema";

export interface LeaveFormProps {
  remainingDays?: number | null;
  isPending?: boolean;
  serverError?: string | null;
  onSubmit?: (values: LeaveFormValues) => void;
  onCancel?: () => void;
  className?: string;
}

export function LeaveForm({
  isPending = false,
  serverError = null,
  onSubmit,
  onCancel,
  className,
}: LeaveFormProps) {
  const {
    data: optionsData,
    isPending: optionsPending,
    isError: optionsError,
  } = useLeaveOptionsQuery();

  const types = useMemo(() => optionsData?.data?.types ?? [], [optionsData]);
  const hasProfile = optionsData?.data?.has_employee_profile ?? true;

  const [leaveTypeId, setLeaveTypeId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedType = useMemo(
    () => types.find((t) => t.id === leaveTypeId) ?? null,
    [types, leaveTypeId],
  );

  const remainingDays = selectedType ? Number(selectedType.remaining) : null;

  const workingDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return countWorkingDays(startDate, endDate);
  }, [startDate, endDate]);

  const projectedRemaining =
    remainingDays !== null ? Math.max(0, remainingDays - workingDays) : null;

  const validate = (): boolean => {
    const values: LeaveFormValues = {
      leave_type_id: leaveTypeId,
      start_date: startDate,
      end_date: endDate,
      reason,
    };

    const schema = createLeaveFormSchema(remainingDays);
    const result = schema.safeParse(values);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const fieldName = String(issue.path[0] ?? "general");
        fieldErrors[fieldName] = issue.message;
      }
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    if (!validate()) return;

    onSubmit?.({
      leave_type_id: leaveTypeId,
      start_date: startDate,
      end_date: endDate,
      reason: reason.trim(),
    });
  };

  const clearFieldError = (field: string) => {
    if (errors[field] || errors.balance) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        delete next.balance;
        return next;
      });
    }
  };

  if (optionsPending) {
    return (
      <Card className="rounded-xl border shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (optionsError) {
    return (
      <Card className="rounded-xl border shadow-sm">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <AlertCircle className="size-8 text-destructive" />
          <p className="text-sm font-medium">Unable to load leave types</p>
          <p className="text-xs text-muted-foreground">
            Please check your network connection or contact an administrator.
          </p>
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Go back
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!hasProfile) {
    return (
      <Card className="rounded-xl border shadow-sm">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Info className="size-8 text-amber-500" />
          <p className="text-sm font-medium">No Employee Profile Found</p>
          <p className="max-w-md text-xs text-muted-foreground">
            Your user account is not linked to an active employee record in this company. Please
            contact HR or your administrator to configure your employee profile.
          </p>
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Go back
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      <Card className="rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle>Leave Application</CardTitle>
          <CardDescription>
            Select a leave category and specify the date range for your leave request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p className="font-medium">{serverError}</p>
            </div>
          )}

          {errors.balance && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p className="font-medium">{errors.balance}</p>
            </div>
          )}

          {/* Leave Type Select */}
          <div className="space-y-2">
            <Label htmlFor="leave-type-select">Leave Type *</Label>
            <Select
              value={leaveTypeId}
              onValueChange={(val) => {
                setLeaveTypeId(val ?? "");
                clearFieldError("leave_type_id");
              }}
              disabled={isPending || types.length === 0}
            >
              <SelectTrigger
                id="leave-type-select"
                aria-invalid={Boolean(errors.leave_type_id)}
                className="w-full"
              >
                <SelectValue placeholder="Select leave category…" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center justify-between gap-4">
                      <span>{type.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({type.remaining} days remaining · {type.is_paid ? "Paid" : "Unpaid"})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leave_type_id && (
              <p className="text-xs text-destructive">{errors.leave_type_id}</p>
            )}

            {selectedType && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[11px]">
                  {selectedType.code}
                </Badge>
                <Badge
                  variant={selectedType.is_paid ? "default" : "secondary"}
                  className="text-[11px]"
                >
                  {selectedType.is_paid ? "Paid Leave" : "Unpaid Leave"}
                </Badge>
                <span>
                  Allowance: <strong>{selectedType.annual_allowance} days/year</strong>
                </span>
                <span>·</span>
                <span>
                  Used: <strong>{selectedType.used} days</strong>
                </span>
                {Boolean(selectedType.pending) && (
                  <>
                    <span>·</span>
                    <span className="text-amber-600 dark:text-amber-400">
                      Pending: <strong>{selectedType.pending} days</strong>
                    </span>
                  </>
                )}
                <span>·</span>
                <span className="text-emerald-600 font-semibold dark:text-emerald-400">
                  Available: {selectedType.remaining} days
                </span>
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date *</Label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    clearFieldError("start_date");
                  }}
                  className="pl-8"
                  disabled={isPending}
                  aria-invalid={Boolean(errors.start_date)}
                />
              </div>
              {errors.start_date && <p className="text-xs text-destructive">{errors.start_date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date *</Label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    clearFieldError("end_date");
                  }}
                  className="pl-8"
                  disabled={isPending}
                  aria-invalid={Boolean(errors.end_date)}
                />
              </div>
              {errors.end_date && <p className="text-xs text-destructive">{errors.end_date}</p>}
            </div>
          </div>

          {/* Working Days & Balance Impact Indicator */}
          {startDate && endDate && startDate <= endDate && (
            <div className="rounded-lg border bg-muted/30 p-3.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Clock className="size-3.5 text-primary" />
                  <span>
                    Duration: <strong>{workingDays} working day(s)</strong>
                  </span>
                  <span className="text-muted-foreground">(weekends excluded)</span>
                </div>
                {remainingDays !== null && (
                  <span
                    className={
                      workingDays > remainingDays
                        ? "font-semibold text-destructive"
                        : "text-muted-foreground"
                    }
                  >
                    Remaining after approval:{" "}
                    <strong>
                      {projectedRemaining !== null ? `${projectedRemaining} day(s)` : "—"}
                    </strong>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="leave-reason">Reason (Optional)</Label>
              <span className="text-[11px] text-muted-foreground">
                {reason.length}/{LEAVE_REASON_MAX_LENGTH}
              </span>
            </div>
            <Textarea
              id="leave-reason"
              placeholder="Provide context or explanation for your leave request…"
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                clearFieldError("reason");
              }}
              disabled={isPending}
              maxLength={LEAVE_REASON_MAX_LENGTH}
            />
            {errors.reason && <p className="text-xs text-destructive">{errors.reason}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={
                isPending || types.length === 0 || (remainingDays !== null && remainingDays <= 0)
              }
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" /> Submit Request
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
