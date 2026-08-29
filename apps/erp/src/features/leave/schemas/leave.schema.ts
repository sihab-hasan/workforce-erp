import { z } from "zod";

/** Server-side limit for the request reason (`leave_requests.reason`). */
export const LEAVE_REASON_MAX_LENGTH = 5000;

const DAY_MS = 86_400_000;

/**
 * Counts working days (Monday–Friday) in the inclusive [startIso, endIso]
 * range, matching the backend calculation (`diffInWeekdays` over the range
 * extended by one day in LeaveController). Dates are parsed as UTC so the
 * count is unaffected by DST transitions.
 */
export function countWorkingDays(startIso: string, endIso: string): number {
  const start = Date.parse(`${startIso}T00:00:00Z`);
  const end = Date.parse(`${endIso}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0;

  let workingDays = 0;
  for (let timestamp = start; timestamp <= end; timestamp += DAY_MS) {
    const weekday = new Date(timestamp).getUTCDay();
    if (weekday !== 0 && weekday !== 6) workingDays += 1;
  }
  return workingDays;
}

/**
 * Builds the leave request form schema.
 *
 * `remainingDays` is the remaining allowance of the selected leave type
 * (`null` while no type is selected). When the requested working days exceed
 * the remaining allowance a `balance` issue is raised so the UI can surface a
 * blocking warning.
 */
export function createLeaveFormSchema(remainingDays: number | null) {
  return z
    .object({
      leave_type_id: z.string().min(1, "Select a leave type."),
      start_date: z.string().min(1, "Select a start date."),
      end_date: z.string().min(1, "Select an end date."),
      reason: z
        .string()
        .max(
          LEAVE_REASON_MAX_LENGTH,
          `Reason must be ${LEAVE_REASON_MAX_LENGTH} characters or fewer.`,
        ),
    })
    .superRefine((values, ctx) => {
      if (!values.start_date || !values.end_date) return;

      if (values.end_date < values.start_date) {
        ctx.addIssue({
          code: "custom",
          path: ["end_date"],
          message: "End date must be on or after the start date.",
        });
        return;
      }
      if (remainingDays !== null) {
        const totalDays = countWorkingDays(values.start_date, values.end_date);
        
        if (totalDays > remainingDays) {
          ctx.addIssue({
            code: "custom",
            path: ["balance"],
            message: `This request needs ${totalDays} working day${totalDays === 1 ? "" : "s"} but only ${remainingDays} day${remainingDays === 1 ? "" : "s"} remain for the selected leave type.`,
          });
        }
      }
    });
}

export type LeaveFormSchema = ReturnType<typeof createLeaveFormSchema>;
export type LeaveFormValues = z.infer<LeaveFormSchema>;
