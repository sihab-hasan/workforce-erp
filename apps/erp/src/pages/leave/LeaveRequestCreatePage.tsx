import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { ErpPage } from "#components/erp/ErpPage";
import { LeaveForm } from "#features/leave/components/LeaveForm";
import { companyRoutes } from "#routes/paths";

export default function LeaveRequestCreatePage() {
  const { tenantKey = "", companyKey = "" } = useParams();
  const navigate = useNavigate();
  const listPath = companyRoutes.leave(tenantKey, companyKey);

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
      <LeaveForm onCancel={() => navigate(listPath)} />
    </ErpPage>
  );
}
