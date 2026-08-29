import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@workforce-erp/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workforce-erp/ui/components/card";
import { Skeleton } from "@workforce-erp/ui/components/skeleton";
import { Field, Input, NativeSelect, Textarea } from "#components/erp/FormControls";
import { errorMessage } from "#features/erp-core/api";
import { companyRoutes } from "#routes/paths";
import { useCreateLeaveMutation } from "../api/leave.mutations";
import { useLeaveOptionsQuery } from "../api/leave.queries";
import {
 
  countWorkingDays,

  countCalendarDays,
 develop
  createLeaveFormSchema,
  type LeaveFormValues,
} from "../schemas/leave.schema";

export interface LeaveFormProps {
  className?: string;
  onCancel?: () => void;
}

type FieldName = keyof LeaveFormValues;

function fieldIssue(
  parsed: ReturnType<ReturnType<typeof createLeaveFormSchema>["safeParse"]>,
  field: FieldName | "balance",
): string | undefined {
  if (parsed.success) return undefined;
  return parsed.error.issues.find((issue) => issue.path[0] === field)?.message;
}

export function LeaveForm({ className, onCancel }: LeaveFormProps) {
  const navigate = useNavigate();
  const { tenantKey = "", companyKey = "" } = useParams();
  const optionsQuery = useLeaveOptionsQuery();
  const createLeave = useCreateLeaveMutation();

  const leaveTypes = optionsQuery.data?.data?.types ?? [];

  const [values, setValues] = useState<LeaveFormValues>({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});

  const selectedType = leaveTypes.find((type) => type.id === values.leave_type_id) ?? null;
 feature/leave-management-92
  const totalDays = countWorkingDays(values.start_date, values.end_date);

  const totalDays = countCalendarDays(values.start_date, values.end_date);
 develop

  const schema = useMemo(
    () => createLeaveFormSchema(selectedType ? Number(selectedType.remaining) : null),
    [selectedType],
  );
  const parsed = schema.safeParse(values);
  const balanceWarning = fieldIssue(parsed, "balance");

  function update<K extends FieldName>(field: K, value: LeaveFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function markTouched(field: FieldName) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function shownError(field: FieldName): string | undefined {
    return touched[field] ? fieldIssue(parsed, field) : undefined;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!parsed.success || !selectedType) return;

    try {
      await createLeave.mutateAsync({
        leave_type_id: values.leave_type_id,
        start_date: values.start_date,
        end_date: values.end_date,
        ...(values.reason.trim() ? { reason: values.reason } : {}),
      });
      toast.success("Leave request submitted");
      navigate(companyRoutes.leave(tenantKey, companyKey));
    } catch (error) {
      toast.error("Unable to submit leave request", { description: errorMessage(error) });
    }
  }

  const optionsUnavailable = optionsQuery.isError || leaveTypes.length === 0;
  const submitDisabled =
    optionsQuery.isPending || optionsUnavailable || !parsed.success || createLeave.isPending;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Leave request</CardTitle>
        <CardDescription>
feature/leave-management-92
          Choose a leave type and the dates you need off. The total working days (Monday–Friday) are
          calculated automatically and checked against your remaining allowance.
        
          Choose a leave type and the dates you need off. The total days (inclusive calendar days)
          are calculated automatically and checked against your remaining allowance.
 develop
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={(event) => void submit(event)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Field
                label="Leave type"
                {...(selectedType
                  ? {
                      hint: `Annual allowance: ${selectedType.annual_allowance} days · Used: ${selectedType.used} · ${selectedType.is_paid ? "Paid" : "Unpaid"}`,
                    }
                  : {})}
              >
                {optionsQuery.isPending ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <NativeSelect
                    required
                    value={values.leave_type_id}
                    disabled={createLeave.isPending || optionsUnavailable}
                    onChange={(event) => update("leave_type_id", event.target.value)}
                    onBlur={() => markTouched("leave_type_id")}
                  >
                    <option value="">Select leave type</option>
                    {leaveTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} · {type.remaining} days remaining
                      </option>
                    ))}
                  </NativeSelect>
                )}
              </Field>
              {optionsQuery.isError && (
                <p className="text-xs text-destructive">
                  Unable to load leave types. Refresh the page and try again.
                </p>
              )}
              {!optionsQuery.isPending && !optionsQuery.isError && leaveTypes.length === 0 && (
                <p className="text-xs text-destructive">
                  No active leave types are configured for this company.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Field label="Start date">
                <Input
                  required
                  type="date"
                  value={values.start_date}
                  disabled={createLeave.isPending}
                  onChange={(event) => update("start_date", event.target.value)}
                  onBlur={() => markTouched("start_date")}
                />
              </Field>
              {shownError("start_date") && (
                <p className="text-xs text-destructive">{shownError("start_date")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Field label="End date">
                <Input
                  required
                  type="date"
                  min={values.start_date || undefined}
                  value={values.end_date}
                  disabled={createLeave.isPending}
                  onChange={(event) => update("end_date", event.target.value)}
                  onBlur={() => markTouched("end_date")}
                />
              </Field>
              {shownError("end_date") && (
                <p className="text-xs text-destructive">{shownError("end_date")}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Field
                label="Reason"
                hint={
                  selectedType && totalDays > 0
 feature/leave-management-92
                    ? `Total working days: ${totalDays} · Remaining for ${selectedType.name}: ${selectedType.remaining} days`

                    ? `Total days: ${totalDays} · Remaining for ${selectedType.name}: ${selectedType.remaining} days`
 develop
                    : "Optional context for the approver"
                }
              >
                <Textarea
                  rows={4}
                  value={values.reason}
                  disabled={createLeave.isPending}
                  onChange={(event) => update("reason", event.target.value)}
                  onBlur={() => markTouched("reason")}
                  placeholder="Optional context for the approver"
                />
              </Field>
              {shownError("reason") && (
                <p className="mt-2 text-xs text-destructive">{shownError("reason")}</p>
              )}
            </div>
          </div>

          {balanceWarning && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {balanceWarning}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2 border-t pt-5">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                disabled={createLeave.isPending}
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={submitDisabled}>
              {createLeave.isPending ? "Submitting…" : "Submit request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
