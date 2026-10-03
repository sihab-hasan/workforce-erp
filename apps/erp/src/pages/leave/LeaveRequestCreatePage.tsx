import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@workforce-erp/ui/components/button";
import { ErpPage } from "#components/erp/ErpPage";
import { errorMessage } from "#features/erp-core/api";
import { useCreateLeaveMutation } from "#features/leave/api/leave.mutations";
import { LeaveForm } from "#features/leave/components/LeaveForm";
import type { LeaveFormValues } from "#features/leave/schemas/leave.schema";
import { companyRoutes } from "#routes/paths";

export default function LeaveRequestCreatePage() {
  const { tenantKey = "", companyKey = "" } = useParams();
  const navigate = useNavigate();
  const listPath = companyRoutes.leave(tenantKey, companyKey);
  const createMutation = useCreateLeaveMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = (values: LeaveFormValues) => {
    setServerError(null);
    createMutation.mutate(
      {
        leave_type_id: values.leave_type_id,
        start_date: values.start_date,
        end_date: values.end_date,
        reason: values.reason,
      },
      {
        onSuccess: () => {
          toast.success("Leave request submitted successfully");
          navigate(listPath);
        },
        onError: (err) => {
          const msg = errorMessage(err);
          setServerError(msg);
          toast.error("Failed to submit leave request", { description: msg });
        },
      },
    );
  };

  return (
    <ErpPage
      title="Request leave"
      description="Submit a leave request for your employee profile."
      actions={
        <Button variant="outline" nativeButton={false} render={<Link to={listPath} />}>
          <ArrowLeft />
          Back to leave requests
        </Button>
      }
    >
      <LeaveForm
        isPending={createMutation.isPending}
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => navigate(listPath)}
      />
    </ErpPage>
  );
}
