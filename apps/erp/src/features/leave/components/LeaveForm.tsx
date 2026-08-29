import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  createLeaveFormSchema,
  LEAVE_REASON_MAX_LENGTH,
} from "../schemas/leave.schema";
import type { LeaveFormValues } from "../schemas/leave.schema";

interface LeaveFormProps {
  remainingDays?: number | null;
  onSubmit?: (values: LeaveFormValues) => void;
  onCancel?: () => void | Promise<void>;
}

export function LeaveForm({ remainingDays = null, onSubmit = () => {} }: LeaveFormProps) {
  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(createLeaveFormSchema(remainingDays ?? null)),
    defaultValues: {
      leave_type_id: "",
      start_date: "",
      end_date: "",
      reason: "",
    },
  });

  const selectedTypeId = form.watch("leave_type_id");
  const totalDays = form.watch("start_date") && form.watch("end_date") ? 1 : 0; // handled by schema superRefine

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Form fields can go here */}
    </form>
  );
}