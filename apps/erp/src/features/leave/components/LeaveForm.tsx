import { useState, type FormEvent } from "react";
import { AlertCircle, Calendar as CalendarIcon, Loader2, Send } from "lucide-react";
import { Button } from "@workforce-erp/ui/components/button";
import { Input } from "@workforce-erp/ui/components/input";
import { Label } from "@workforce-erp/ui/components/label";
import { Textarea } from "@workforce-erp/ui/components/textarea";
import { Checkbox } from "@workforce-erp/ui/components/checkbox";
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

export interface LeaveFormData {
  leave_type: string;
  start_date: string;
  end_date: string;
  is_half_day: boolean;
  half_day_period?: "first_half" | "second_half";
  reason: string;
  handover_to?: string;
  emergency_contact?: string;
}

export interface LeaveFormProps {
  initialValues?: Partial<LeaveFormData>;
  isPending?: boolean;
  serverError?: string | null;
  onSubmit?: (values: LeaveFormData) => void;
  onCancel?: () => void;
  className?: string;
}

const LEAVE_TYPES = [
  { id: "annual", name: "Annual / Vacation Leave (12 days left)" },
  { id: "sick", name: "Sick / Medical Leave (8 days left)" },
  { id: "casual", name: "Casual / Personal Leave (5 days left)" },
  { id: "unpaid", name: "Leave Without Pay (LWP)" },
  { id: "parental", name: "Maternity / Paternity Leave" },
];

export function LeaveForm({
  initialValues,
  isPending = false,
  serverError,
  onSubmit,
  onCancel,
  className,
}: LeaveFormProps) {
  const [formData, setFormData] = useState<LeaveFormData>({
    leave_type: initialValues?.leave_type ?? "annual",
    start_date: initialValues?.start_date ?? new Date().toISOString().split("T")[0] ?? "",
    end_date: initialValues?.end_date ?? new Date().toISOString().split("T")[0] ?? "",
    is_half_day: initialValues?.is_half_day ?? false,
    half_day_period: initialValues?.half_day_period ?? "first_half",
    reason: initialValues?.reason ?? "",
    handover_to: initialValues?.handover_to ?? "",
    emergency_contact: initialValues?.emergency_contact ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof LeaveFormData>(key: K, value: LeaveFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.leave_type) errs.leave_type = "Select a leave category.";
    if (!formData.start_date) errs.start_date = "Start date is required.";
    if (!formData.end_date) errs.end_date = "End date is required.";
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      errs.end_date = "End date cannot be earlier than start date.";
    }
    if (!formData.reason.trim() || formData.reason.trim().length < 5) {
      errs.reason = "Please provide a reason (at least 5 characters).";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || isPending) return;
    onSubmit?.(formData);
  };

  // Calculate duration in days
  const calculateDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    if (formData.is_half_day) return 0.5;
    const start = new Date(formData.start_date).getTime();
    const end = new Date(formData.end_date).getTime();
    if (end < start) return 0;
    return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const requestedDays = calculateDays();

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      <Card className="rounded-xl border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Request Time Off</CardTitle>
              <CardDescription>
                Submit a leave application for manager and HR approval
              </CardDescription>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {requestedDays} {requestedDays === 1 ? "Day" : "Days"} Requested
            </span>
          </div>
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

          {/* Leave Type */}
          <div className="space-y-2">
            <Label htmlFor="leave-type">Leave Category *</Label>
            <Select
              value={formData.leave_type}
              onValueChange={(val) => {
                if (val) update("leave_type", val);
              }}
              disabled={isPending}
            >
              <SelectTrigger id="leave-type">
                <SelectValue placeholder="Select leave category" />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leave_type && <p className="text-xs text-destructive">{errors.leave_type}</p>}
          </div>

          {/* Date Range */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="leave-start-date">Start Date *</Label>
              <div className="relative">
                <CalendarIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="leave-start-date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => {
                    update("start_date", e.target.value);
                    if (!formData.end_date || formData.end_date < e.target.value) {
                      update("end_date", e.target.value);
                    }
                  }}
                  className="pl-8"
                  disabled={isPending}
                  aria-invalid={Boolean(errors.start_date)}
                />
              </div>
              {errors.start_date && <p className="text-xs text-destructive">{errors.start_date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="leave-end-date">End Date *</Label>
              <div className="relative">
                <CalendarIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="leave-end-date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => update("end_date", e.target.value)}
                  className="pl-8"
                  disabled={isPending || formData.is_half_day}
                  aria-invalid={Boolean(errors.end_date)}
                />
              </div>
              {errors.end_date && <p className="text-xs text-destructive">{errors.end_date}</p>}
            </div>
          </div>

          {/* Half day checkbox */}
          <div className="flex flex-col gap-3 rounded-lg border p-3.5 bg-muted/20">
            <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
              <Checkbox
                checked={formData.is_half_day}
                onCheckedChange={(checked) => {
                  const isHalf = Boolean(checked);
                  update("is_half_day", isHalf);
                  if (isHalf) {
                    update("end_date", formData.start_date);
                  }
                }}
                disabled={isPending}
              />
              <span className="font-medium text-foreground">Half-day leave</span>
            </label>

            {formData.is_half_day && (
              <div className="flex gap-4 pt-1 pl-6">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="half-day-period"
                    value="first_half"
                    checked={formData.half_day_period === "first_half"}
                    onChange={() => update("half_day_period", "first_half")}
                    disabled={isPending}
                  />
                  <span>First Half (Morning)</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="half-day-period"
                    value="second_half"
                    checked={formData.half_day_period === "second_half"}
                    onChange={() => update("half_day_period", "second_half")}
                    disabled={isPending}
                  />
                  <span>Second Half (Afternoon)</span>
                </label>
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="leave-reason">Reason for Absence *</Label>
            <Textarea
              id="leave-reason"
              placeholder="Provide context or explanation for your leave request…"
              rows={3}
              value={formData.reason}
              onChange={(e) => update("reason", e.target.value)}
              disabled={isPending}
              aria-invalid={Boolean(errors.reason)}
            />
            {errors.reason && <p className="text-xs text-destructive">{errors.reason}</p>}
          </div>

          {/* Handover & Emergency Contact */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="leave-handover">Handover Colleague</Label>
              <Input
                id="leave-handover"
                placeholder="e.g. Michael Scott"
                value={formData.handover_to}
                onChange={(e) => update("handover_to", e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-emergency">Emergency Phone</Label>
              <Input
                id="leave-emergency"
                type="tel"
                placeholder="+880 1XXXXXXXXX"
                value={formData.emergency_contact}
                onChange={(e) => update("emergency_contact", e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" /> Submit Leave Request
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
