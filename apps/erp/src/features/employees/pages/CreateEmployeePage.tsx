import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@workforce-erp/ui/components/button";
import { ErpPage } from "#components/erp/ErpPage";
import { EmployeeForm, type EmployeeFormData } from "../components/EmployeeForm";
import { useEmployeeOptions } from "../hooks/use-employees";
import { companyRoutes } from "#routes/paths";

export default function CreateEmployeePage() {
  const navigate = useNavigate();
  const { tenantKey = "", companyKey = "" } = useParams();
  const optionsQuery = useEmployeeOptions();
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const departments = optionsQuery.data?.data?.departments ?? [];
  const locations = optionsQuery.data?.data?.locations ?? [];

  const handleCreate = async (_values: EmployeeFormData) => {
    setIsPending(true);
    setServerError(null);
    try {
      setTimeout(() => {
        if (tenantKey && companyKey) {
          navigate(companyRoutes.employees(tenantKey, companyKey));
        } else {
          navigate(-1);
        }
      }, 500);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to create employee profile.");
      setIsPending(false);
    }
  };

  const backUrl = tenantKey && companyKey ? companyRoutes.employees(tenantKey, companyKey) : "..";

  return (
    <ErpPage
      title="Create employee"
      description="Register a worker record, assign workplace hierarchy, and configure role status."
      actions={
        <Button variant="outline" nativeButton={false} render={<Link to={backUrl} />}>
          <ArrowLeft />
          Back to directory
        </Button>
      }
    >
      <div className="mx-auto max-w-4xl">
        <EmployeeForm
          departments={departments}
          locations={locations}
          isPending={isPending}
          serverError={serverError}
          onSubmit={handleCreate}
          onCancel={() => navigate(backUrl)}
          submitLabel="Create Employee"
        />
      </div>
    </ErpPage>
  );
}
